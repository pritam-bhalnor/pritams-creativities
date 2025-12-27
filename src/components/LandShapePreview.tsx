import React, { useMemo, useState } from 'react';
import { Cut, Partition } from '../types';

interface ShapeLabels {
  left: string;
  right: string;
  base: string;
  top: string;
}

interface LandShapePreviewProps {
  left: number;
  right: number;
  bottom: number;
  top: number;
  labels?: ShapeLabels;
  isEditing?: boolean;
  onDimensionChange?: (side: 'left' | 'right' | 'bottom' | 'top', value: string) => void;
  cuts?: Cut[];
  partitions?: Partition[];
  measureFrom?: 'left' | 'right';
}


export const LandShapePreview: React.FC<LandShapePreviewProps> = ({
  left,
  right,
  bottom,
  top,
  labels = { left: 'Left', right: 'Right', base: 'Base', top: 'Top' },
  isEditing = false,
  onDimensionChange,
  cuts = [],
  partitions = [],
  measureFrom = 'left'
}) => {
  const hasAllDimensions = left > 0 && right > 0 && bottom > 0 && top > 0;
  const svgW = 640; // Wider to accommodate side labels
  const svgH = 400; 
  const [hoveredPartitionIndex, setHoveredPartitionIndex] = useState<number | null>(null);

  const pathData = useMemo(() => {
    // 0. Pre-process cuts/partitions for direction
    let effectiveCuts = cuts;
    let effectivePartitions = partitions;

    if (measureFrom === 'right') {
        const safeBottomVal = bottom || 100;
        const safeTopVal = top || 100;

        effectivePartitions = [...partitions].reverse();
        effectiveCuts = cuts.map(c => ({
            ...c,
            x: safeBottomVal - c.x,
            y: safeTopVal - c.y
        })).sort((a, b) => a.x - b.x);
    }

    if (!hasAllDimensions && !isEditing) {
      // Default square
      return {
        path: `M 190 120 L 450 120 L 450 280 L 190 280 Z`, // Centered rectangle placeholder
        viewBox: `0 0 ${svgW} ${svgH}`,
        pTL: { x: 190, y: 120 },
        pTR: { x: 450, y: 120 },
        pBL: { x: 190, y: 280 },
        pBR: { x: 450, y: 280 },
        isValid: false,
        cutLines: [],
        partitionPolygons: []
      };
    }

    // "General Quadrilateral Construction"
    // Terminology: P0(BL), P1(BR), P2(TR), P3(TL)
    
    // 1. Calculate valid diagonal range for Diagonal (BL -> TR)
    // Triangle 1 (Bottom, Right, Diag) -> exists if |Bottom-Right| < Diag < Bottom+Right
    // Triangle 2 (Left, Top, Diag)    -> exists if |Left-Top| < Diag < Left+Top
    
    // Use fallback values 100 if 0/NaN during editing availability to keep shape visible
    const safeLeft = left || 100;
    const safeRight = right || 100;
    const safeBottom = bottom || 100;
    const safeTop = top || 100;

    const minD1 = Math.abs(safeBottom - safeRight);
    const maxD1 = safeBottom + safeRight;
    
    const minD2 = Math.abs(safeLeft - safeTop);
    const maxD2 = safeLeft + safeTop;
    
    const minDiag = Math.max(minD1, minD2);
    const maxDiag = Math.min(maxD1, maxD2);
    
    let diag = 0;
    let isValid = true;

    if (minDiag >= maxDiag) {
      // Impossible geometry - fallback
       isValid = false;
       diag = Math.sqrt(safeBottom * safeBottom + safeLeft * safeLeft); 
    } else {
        // 2. Choose a "nice" diagonal
        const idealD1 = Math.sqrt(safeBottom * safeBottom + safeRight * safeRight);
        const idealD2 = Math.sqrt(safeLeft * safeLeft + safeTop * safeTop);
        
        // Average them for balance, or pick one. Average is safer.
        diag = (idealD1 + idealD2) / 2;
        
        // Clamp to valid range with padding
        const epsilon = 0.5; // Small padding to avoid flat triangles
        diag = Math.max(minDiag + epsilon, Math.min(maxDiag - epsilon, diag));
    }

    // 3. Coordinate Construction
    // Place P0 (BL) at (0, 0)
    // Place P1 (BR) at (Bottom, 0)
    const p0 = { x: 0, y: 0 };
    const p1 = { x: safeBottom, y: 0 };

    // Find P2 (TR)
    let p2 = { x: safeBottom, y: safeRight }; // Default if invalid
    if (isValid) {
        const cosA = (safeBottom * safeBottom + diag * diag - safeRight * safeRight) / (2 * safeBottom * diag);
        const angleA = Math.acos(Math.max(-1, Math.min(1, cosA))); // Angle of Diag from Bottom side
        p2 = {
          x: diag * Math.cos(angleA),
          y: diag * Math.sin(angleA)
        };
    }

    // Find P3 (TL)
    let p3 = { x: 0, y: safeLeft }; // Default if invalid
    if (isValid) {
        const cosB = (diag * diag + safeLeft * safeLeft - safeTop * safeTop) / (2 * diag * safeLeft);
        const angleB = Math.acos(Math.max(-1, Math.min(1, cosB)));
        
        // Recalculate AngleA for P3 context
        const cosA_P3context = (safeBottom * safeBottom + diag * diag - safeRight * safeRight) / (2 * safeBottom * diag);
        const angleA_P3context = Math.acos(Math.max(-1, Math.min(1, cosA_P3context)));

        // For a convex quadrilateral (0 -> Bottom -> Right -> Top -> Left -> 0), 
        // The angle of P3 should be greater than AngleA (counter-clockwise).
        const angleP3 = angleA_P3context + angleB; 
        p3 = {
          x: safeLeft * Math.cos(angleP3),
          y: safeLeft * Math.sin(angleP3)
        };
    }

    // 4. Calculate Cut Lines (in Math coordinates)
    const cutLines = effectiveCuts.map(cut => {
        const startPoint = { x: cut.x, y: 0 };
        const vTop = { x: p2.x - p3.x, y: p2.y - p3.y };
        const lengthTop = Math.sqrt(vTop.x * vTop.x + vTop.y * vTop.y);
        const scale = lengthTop > 0.001 ? cut.y / lengthTop : 0;
        
        const endPoint = {
            x: p3.x + vTop.x * scale,
            y: p3.y + vTop.y * scale
        };
        
        return { start: startPoint, end: endPoint };
    });

    // 5. Transform to SVG ViewBox
    const xs = [p0.x, p1.x, p2.x, p3.x];
    const ys = [p0.y, p1.y, p2.y, p3.y];
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const w = maxX - minX || 100;
    const h = maxY - minY || 100;
    const paddingX = 80; 
    const paddingY = 40;
    const scale = Math.min((svgW - 2 * paddingX) / w, (svgH - 2 * paddingY) / h);

    const mathCX = minX + w / 2;
    const mathCY = minY + h / 2;
    const svgCX = svgW / 2;
    const svgCY = svgH / 2;

    const toSVG = (pt: {x: number, y: number}) => ({
      x: svgCX + (pt.x - mathCX) * scale,
      y: svgCY - (pt.y - mathCY) * scale
    });
    
    // Transform cut lines
    const svgCutLines = cutLines.map(line => ({
        start: toSVG(line.start),
        end: toSVG(line.end)
    }));

    // Calculate Partition Polygons (In SVG Coords)
    // Vertices needed: BL, BR, TR, TL for each partition
    const partitionPolygons = effectivePartitions.map((part, index) => {
         // Left Side is defined by previous Cut's Right side (or P3->P0 for first)
         // Right Side is defined by current Cut (or P2->P1 for last)
         
         // Left Boundary Line (Bottom to Top direction usually for cuts, but here we need 4 points)
         let p_BL, p_TL, p_BR, p_TR;
         
         if (index === 0) {
            p_BL = toSVG(p0);
            p_TL = toSVG(p3);
         } else {
            p_BL = svgCutLines[index - 1].start;
            p_TL = svgCutLines[index - 1].end;
         }
         
         if (index === effectivePartitions.length - 1) {
            p_BR = toSVG(p1);
            p_TR = toSVG(p2);
         } else {
            p_BR = svgCutLines[index].start;
            p_TR = svgCutLines[index].end;
         }
         
         // Ensure we have valid points
         if (!p_BL || !p_BR || !p_TR || !p_TL) return null;

         // Polygon points order for <polygon points="...">: BL, BR, TR, TL
         const pointsString = `${p_BL.x},${p_BL.y} ${p_BR.x},${p_BR.y} ${p_TR.x},${p_TR.y} ${p_TL.x},${p_TL.y}`;
         
         // Calculate centroids for labels
         const center = {
             x: (p_BL.x + p_BR.x + p_TR.x + p_TL.x) / 4,
             y: (p_BL.y + p_BR.y + p_TR.y + p_TL.y) / 4
         };

         // Side Midpoints
         const midLeft = { x: (p_BL.x + p_TL.x)/2, y: (p_BL.y + p_TL.y)/2 };
         const midRight = { x: (p_BR.x + p_TR.x)/2, y: (p_BR.y + p_TR.y)/2 };
         const midBottom = { x: (p_BL.x + p_BR.x)/2, y: (p_BL.y + p_BR.y)/2 };
         const midTop = { x: (p_TL.x + p_TR.x)/2, y: (p_TL.y + p_TR.y)/2 };

         return {
            points: pointsString,
            data: part,
            center,
            midLeft, midRight, midBottom, midTop
         };
    }).filter(p => p !== null);


    return {
      path: `M ${toSVG(p3).x} ${toSVG(p3).y} L ${toSVG(p2).x} ${toSVG(p2).y} L ${toSVG(p1).x} ${toSVG(p1).y} L ${toSVG(p0).x} ${toSVG(p0).y} Z`,
      viewBox: `0 0 ${svgW} ${svgH}`,
      pTL: toSVG(p3),
      pTR: toSVG(p2),
      pBL: toSVG(p0),
      pBR: toSVG(p1),
      isValid: isValid,
      cutLines: svgCutLines,
      partitionPolygons
    };

  }, [left, right, bottom, top, hasAllDimensions, isEditing, svgW, svgH, cuts, partitions, measureFrom]);

  const renderInput = (
    x: number, 
    y: number, 
    value: number, 
    side: 'left' | 'right' | 'bottom' | 'top',
    label: string
  ) => {
    return (
      <foreignObject x={x - 40} y={y - 15} width="80" height="50">
        <div className="flex flex-col items-center justify-center">
            <input
              type="number"
              value={value || ''}
              onChange={(e) => onDimensionChange?.(side, e.target.value)}
              className="w-16 px-1 py-0.5 text-center text-xs font-bold bg-white dark:bg-slate-800 border border-primary-500 rounded shadow-sm focus:ring-2 focus:ring-primary-500 outline-none"
              autoFocus={side === 'bottom'} // Just a heuristic
            />
            <span className="text-[9px] text-gray-900 dark:text-gray-100 font-bold bg-white/80 dark:bg-slate-900/80 px-1 rounded mt-0.5">{label}</span>
        </div>
      </foreignObject>
    );
  };

  return (
    <div className={`w-full bg-gray-50 dark:bg-slate-900/50 rounded-xl border-2 ${hasAllDimensions || isEditing ? 'border-primary-100 dark:border-primary-900/30' : 'border-dashed border-gray-200 dark:border-slate-800'} p-4 flex flex-col items-center justify-center transition-all duration-300`}>
      <div className="relative w-full aspect-[16/10]">
         <svg width="100%" height="100%" viewBox={pathData.viewBox} className="overflow-visible">
            <path 
              d={pathData.path}
              className={`${hasAllDimensions || isEditing ? 'fill-primary-500/10 stroke-primary-500' : 'fill-gray-200/50 dark:fill-slate-700/50 stroke-gray-300 dark:stroke-slate-600'}`}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Render Cut Lines */}
            {pathData.cutLines.map((line, idx) => (
                <line 
                    key={idx}
                    x1={line.start.x} y1={line.start.y}
                    x2={line.end.x} y2={line.end.y}
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                    className="text-purple-500/70 dark:text-purple-400/80 pointer-events-none"
                />
            ))}

            {/* Render Interactive Partition Polygons */}
            {pathData.partitionPolygons && pathData.partitionPolygons.map((poly, idx) => (
               <g key={idx}>
                  <polygon
                     points={poly?.points}
                     fill="transparent"
                     className="cursor-pointer transition-all duration-200 hover:fill-primary-500/20"
                     onMouseEnter={() => setHoveredPartitionIndex(idx)}
                     onMouseLeave={() => setHoveredPartitionIndex(null)}
                  />
                  {/* Always Show Side Length Labels */}
                  {poly && (
                      <>
                         {/* Left - Only show for first partition to avoid overlap, or offset? 
                             Actually, inner cuts share lines. Let's show Left for all, 
                             but for shared lines (inner), we might get double text. 
                             Strategy: Show Left for all. If it overlaps, it overlaps (usually same value).
                             To be cleaner: Show Left for Partition 0. Show Right for all Partitions. 
                             Wait, Partition i Right == Partition i+1 Left. 
                             So: Show Left for index 0. Show Right for all indices. 
                             That covers all vertical lines.
                          */}
                         
                         {/* Left Side Label - Show only for first partition */}
                         {idx === 0 && (
                             <text x={poly.midLeft.x - 5} y={poly.midLeft.y} textAnchor="end" dominantBaseline="middle" className="text-[9px] font-bold fill-gray-700 dark:fill-gray-300 bg-white/50 px-1 select-none pointer-events-none shadow-sm pb-1">
                                {poly.data.leftSide}
                             </text>
                         )}

                         {/* Right Side Label - Show for all (covers next partition's left) */}
                         <text x={poly.midRight.x + 5} y={poly.midRight.y} textAnchor="start" dominantBaseline="middle" className="text-[9px] font-bold fill-gray-700 dark:fill-gray-300 bg-white/50 px-1 select-none pointer-events-none pb-1">
                            {poly.data.rightSide}
                         </text>

                         {/* Bottom */}
                         <text x={poly.midBottom.x} y={poly.midBottom.y + 12} textAnchor="middle" dominantBaseline="middle" className="text-[9px] font-bold fill-gray-700 dark:fill-gray-300 bg-white/50 px-1 select-none pointer-events-none">
                            {poly.data.bottomSide}
                         </text>

                         {/* Top */}
                         <text x={poly.midTop.x} y={poly.midTop.y - 12} textAnchor="middle" dominantBaseline="middle" className="text-[9px] font-bold fill-gray-700 dark:fill-gray-300 bg-white/50 px-1 select-none pointer-events-none">
                            {poly.data.topSide}
                         </text>
                      </>
                  )}

                  {/* Show details on hover */}
                  {hoveredPartitionIndex === idx && poly && (
                      <>
                        {/* Area Tooltip at Center */}
                        <foreignObject x={poly.center.x - 50} y={poly.center.y - 25} width="100" height="50" className="pointer-events-none z-50">
                            <div className="flex flex-col items-center justify-center h-full"> 
                                <div className="bg-slate-900/90 backdrop-blur text-white text-[10px] px-3 py-1.5 rounded-lg shadow-xl border border-white/10 whitespace-nowrap">
                                   <div className="font-bold text-emerald-400">Area: {poly.data.area.sqFt} sq ft</div>
                                   <div className="opacity-80 text-[9px]">{poly.data.area.guntha} Guntha</div>
                                </div>
                            </div>
                        </foreignObject>
                      </>
                  )}
               </g>
            ))}
            
            {(hasAllDimensions || isEditing) && (
              <>
                 {/* Bottom / Base Main Label */}
                    {isEditing ? 
                    renderInput((pathData.pBL.x + pathData.pBR.x)/2, pathData.pBL.y + 20, bottom, 'bottom', labels.base) :
                    <text x={(pathData.pBL.x + pathData.pBR.x)/2} y={pathData.pBL.y + 35} textAnchor="middle" className="text-[10px] font-bold fill-gray-900 dark:fill-white">{labels.base}: {bottom}</text>
                 }

                 {/* Top Main Label */}
                 {isEditing ?
                    renderInput((pathData.pTL.x + pathData.pTR.x)/2, pathData.pTL.y - 25, top, 'top', labels.top) :
                    <text x={(pathData.pTL.x + pathData.pTR.x)/2} y={pathData.pTL.y - 25} textAnchor="middle" className="text-[10px] font-bold fill-gray-900 dark:fill-white">{labels.top}: {top}</text>
                 }

                 {/* Left Main Label */}
                 {isEditing ?
                    renderInput(pathData.pTL.x - 30, (pathData.pTL.y + pathData.pBL.y)/2, left, 'left', labels.left) :
                    <text x={pathData.pTL.x - 70} y={(pathData.pTL.y + pathData.pBL.y)/2} textAnchor="middle" className="text-[10px] font-bold fill-gray-900 dark:fill-white">{labels.left}: {left}</text>
                 }

                 {/* Right Main Label */}
                 {isEditing ?
                    renderInput(pathData.pTR.x + 30, (pathData.pTR.y + pathData.pBR.y)/2, right, 'right', labels.right) :
                    <text x={pathData.pTR.x + 55} y={(pathData.pTR.y + pathData.pBR.y)/2} textAnchor="middle" className="text-[10px] font-bold fill-gray-900 dark:fill-white">{labels.right}: {right}</text>
                 }
              </>
            )}
            
            {(!hasAllDimensions && !isEditing) && (
               <text x={svgW / 2} y={svgH / 2} textAnchor="middle" dominantBaseline="middle" className="text-sm font-medium fill-gray-400 pointer-events-none select-none">
                 Enter dimensions to preview
               </text>
            )}
         </svg>
      </div>
    </div>
  );
};
