import { Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';

function App() {
  return (
    <div className="min-h-screen p-4 sm:p-8 font-sans selection:bg-primary-500 selection:text-white">
      <div className="max-w-6xl mx-auto">
        <Header />
        
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </div>
  );
}

export default App;
