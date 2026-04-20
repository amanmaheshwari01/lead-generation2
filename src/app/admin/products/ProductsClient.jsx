"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Store, Save, X, Loader2, Pencil, Check, Plus } from "lucide-react";
import { userAPI } from "@/lib/api";

export default function ProductsClient({ initialProducts }) {
  const [products, setProducts] = useState(initialProducts || []);
  
  // Appending new product state
  const [newProductName, setNewProductName] = useState("");
  
  // Editing state
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editProductName, setEditProductName] = useState("");

  const [savingProducts, setSavingProducts] = useState(false);

  const handleAddProduct = () => {
    if (!newProductName.trim()) {
      toast.error("Please provide a Product Name.");
      return;
    }
    
    // Check for duplicate names
    const isDuplicate = products.some(p => p.productName.toLowerCase() === newProductName.trim().toLowerCase());
    
    if (isDuplicate) {
      toast.error("This product is already in your catalog.");
      return;
    }

    setProducts([...products, { productName: newProductName.trim() }]);
    setNewProductName("");
  };

  const handleRemoveProduct = (index) => {
    const updatedProducts = [...products];
    updatedProducts.splice(index, 1);
    setProducts(updatedProducts);
    
    if (editingIndex === index) {
        setEditingIndex(-1);
    }
  };
  
  const startEditing = (index, product) => {
      setEditingIndex(index);
      setEditProductName(product.productName);
  };
  
  const saveEdit = () => {
      if (!editProductName.trim()) {
          toast.error("Product name cannot be empty.");
          return;
      }
      
      const updatedProducts = [...products];
      updatedProducts[editingIndex] = {
          ...updatedProducts[editingIndex],
          productName: editProductName.trim()
      };
      
      setProducts(updatedProducts);
      setEditingIndex(-1);
  };

  const handleSaveProducts = async () => {
    if (editingIndex !== -1) {
      toast.error("Please finish editing your product before saving.");
      return;
    }

    setSavingProducts(true);
    try {
      const { data } = await userAPI.updateShopProducts(products);
      if (data.success) {
        setProducts(data.products); 
        toast.success("Products synced to database successfully!");
      } else {
        toast.error(data.message || "Failed to update products");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not connect to server");
    } finally {
      setSavingProducts(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto animate-fadeIn">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-theme-navy tracking-tight">Shop Products Collection</h1>
        <p className="text-theme-slate/80 mt-2 text-sm max-w-md">Manage the base products for your walk-in lead generation tools.</p>
      </header>

      <div className="glass-panel p-6 sm:p-10 rounded-3xl animate-fadeIn">
        <div className="space-y-8">
          
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-theme-accent/5 rounded-xl text-theme-accent border border-theme-accent/10">
                <Store size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-theme-navy tracking-tight">Inventory List</h2>
                <p className="text-[11px] text-theme-slate/60 font-medium">Add, update, or remove items from your catalog</p>
              </div>
            </div>
            <button
              onClick={handleSaveProducts}
              disabled={savingProducts}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-theme-navy text-white rounded-xl transition-all font-semibold text-xs shadow-md shadow-theme-navy/20 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer disabled:opacity-50"
            >
              {savingProducts ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save All Changes to Database
            </button>
          </div>

          <hr className="border-theme-slate/5" />

          {/* Add New Product Form */}
          <div className="bg-theme-navy/5 p-5 rounded-2xl border border-theme-navy/5">
            <h3 className="text-xs font-bold text-theme-slate uppercase tracking-wider mb-4">Add New Product</h3>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="e.g. Cricket Bat"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddProduct()}
                  className="w-full px-4 py-3 rounded-xl border border-white focus:border-theme-accent font-medium text-sm text-theme-navy outline-none transition-all shadow-sm bg-white/70"
                />
              </div>
              <div className="flex items-center">
                <button
                  onClick={handleAddProduct}
                  className="w-full md:w-auto px-8 py-3 bg-theme-accent text-white rounded-xl font-semibold text-xs hover:bg-theme-accent/90 transition-all shadow-md shadow-theme-accent/20 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Plus size={16} />
                  ADD PRODUCT
                </button>
              </div>
            </div>
          </div>

          {/* Products List */}
          <div className="bg-white/40 backdrop-blur-sm rounded-3xl border border-theme-slate/10 overflow-hidden shadow-sm">
            {products.length > 0 ? (
              <div className="divide-y divide-theme-slate/5">
                  {products.map((product, index) => (
                    <div key={product._id || index} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 hover:bg-white/60 transition-all group gap-4 sm:gap-0">
                      
                      <div className="flex-1 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-theme-accent/5 flex items-center justify-center text-theme-accent shrink-0 border border-theme-accent/10 shadow-sm shadow-theme-accent/5">
                           <span className="text-xs font-bold">{index + 1}</span>
                        </div>
                        
                        {editingIndex === index ? (
                            <input
                              type="text"
                              value={editProductName}
                              onChange={(e) => setEditProductName(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                              className="w-full max-w-sm px-4 py-2.5 rounded-xl border border-theme-accent/30 focus:border-theme-accent font-semibold text-sm text-theme-navy outline-none shadow-sm bg-white transition-all ring-2 ring-transparent focus:ring-theme-accent/10"
                              autoFocus
                            />
                        ) : (
                            <span className="font-bold text-[15px] text-theme-navy tracking-tight">{product.productName}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 sm:pl-4 self-end sm:self-auto">
                             {editingIndex === index ? (
                                <>
                                    <button
                                        onClick={saveEdit}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-theme-accent text-white hover:bg-theme-accent/90 rounded-xl transition-all font-bold text-xs shadow-md shadow-theme-accent/20 hover:-translate-y-0.5"
                                    >
                                        <Check size={14} />
                                        <span>SAVE</span>
                                    </button>
                                    <button
                                        onClick={() => setEditingIndex(-1)}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-theme-slate/10 text-theme-slate hover:bg-theme-slate/20 hover:text-theme-navy rounded-xl transition-all font-bold text-xs"
                                    >
                                        <X size={14} />
                                        <span>CANCEL</span>
                                    </button>
                                </>
                             ) : (
                                <>
                                    <button
                                        onClick={() => startEditing(index, product)}
                                        className="flex items-center gap-2 px-4 py-2 text-theme-slate/60 hover:text-theme-accent hover:bg-theme-accent/10 rounded-xl transition-colors text-xs font-bold"
                                    >
                                        <Pencil size={14} />
                                        <span className="hidden sm:inline">EDIT</span>
                                    </button>
                                    <button
                                        onClick={() => handleRemoveProduct(index)}
                                        className="flex items-center gap-2 px-4 py-2 text-theme-slate/60 hover:text-theme-error hover:bg-theme-error/10 rounded-xl transition-colors text-xs font-bold"
                                    >
                                        <X size={14} />
                                        <span className="hidden sm:inline">REMOVE</span>
                                    </button>
                                </>
                             )}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="w-full py-16 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-theme-slate/5 flex items-center justify-center rounded-2xl mb-4">
                    <Store className="w-8 h-8 text-theme-slate/30" />
                </div>
                <p className="text-base font-bold text-theme-navy tracking-tight">Catalog is Empty</p>
                <p className="text-xs text-theme-slate/70 mt-1 max-w-sm">Use the form above to quickly add standard products.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
