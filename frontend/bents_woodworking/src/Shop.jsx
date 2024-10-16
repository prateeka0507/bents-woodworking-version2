import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Button } from './components/ui/button.jsx'
import { Card, CardContent, CardFooter } from './components/ui/card.jsx'
import { Loader2, ExternalLink, Search } from 'lucide-react'

function ProductCard({ product }) {
  const imageUrl = product.image_data
    ? `data:image/jpeg;base64,${product.image_data}`
    : '/path/to/default/image.jpg';
  return (
    <Card className="w-full flex flex-col h-full">
      <CardContent className="p-4 flex-grow flex flex-col">
        <div className="flex flex-col items-center mb-4">
          <div className="w-full h-48 flex items-center justify-center bg-gray-100 rounded-md overflow-hidden mb-4">
            <img
              src={imageUrl}
              alt={product.title}
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <h3 className="font-semibold text-lg text-center mb-2">{product.title}</h3>
        </div>
      </CardContent>
      <CardFooter className="mt-auto flex justify-center p-4">
        <a
          href={product.link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center text-blue-500 hover:text-blue-600 text-sm font-medium"
        >
          View Product <ExternalLink size={12} className="ml-1" />
        </a>
      </CardFooter>
    </Card>
  );
}

export default function Shop() {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('https://bents-model-backend.vercel.app/api/products');
        setProducts(response.data);
        setFilteredProducts(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to fetch products. Please try again later.');
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const results = products.filter(product =>
      product.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(results);
  }, [searchTerm, products]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  if (error) {
    return (
      <div className="text-center mt-8 text-red-500" role="alert">
        <p>{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-2 py-4 max-w-7xl">
      <header className="mb-6">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-center mb-4">
          Recommended Products
        </h1>
        <div className="relative max-w-md mx-auto">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>
      </header>
      <main>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
        {!loading && filteredProducts.length === 0 && (
          <p className="text-center text-gray-500 mt-8">No products found matching your search.</p>
        )}
      </main>
    </div>
  )
}
