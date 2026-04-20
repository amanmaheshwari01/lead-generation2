"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Store, X, Loader2, Pencil, Check, Plus, Trash2 } from "lucide-react";
import { userAPI } from "@/lib/api";
import DeleteConfirmationModal from "@/components/deleteConfirmationModal";

export default function ProductsClient({ initialProducts }) {
  const [products, setProducts] = useState(initialProducts || []);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Appending new product state
  const [newProductName, setNewProductName] = useState("");
  
  // Editing state
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editProductName, setEditProductName] = useState("");

  // Deletion state
  const [deleteTarget, setDeleteTarget] = useState(null);

  /**
   * Universal Sync Function
   * Persists the current state of products to the backend
   */
  const syncChanges = async (updatedProducts) => {
    setIsSyncing(true);
    try {
      const { data } = await userAPI.updateShopProducts(updatedProducts);
      if (data.success) {
        setProducts(data.products); 
        return true;
      } else {
        toast.error(data.message || "Sync failed");
        return false;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Connection error - check your network");
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAddProduct = async () => {
    if (!newProductName.trim()) {
      toast.error("Please provide a Product Name.");
      return;
    }
    
    const isDuplicate = products.some(p => p.productName.toLowerCase() === newProductName.trim().toLowerCase());
    if (isDuplicate) {
      toast.error("This product is already in your catalog.");
      return;
    }

    const updated = [...products, { productName: newProductName.trim() }];
    const success = await syncChanges(updated);
    if (success) {
      setNewProductName("");
      toast.success(`${newProductName.trim()} added to catalog`);
    }
  };

  const handleRemoveProduct = async () => {
    if (!deleteTarget) return;

    const updated = products.filter((_, i) => i !== deleteTarget.index);
    const success = await syncChanges(updated);
    
    if (success) {
      toast.success(`${deleteTarget.name} removed from catalog`);
      setDeleteTarget(null);
      if (editingIndex === deleteTarget.index) setEditingIndex(-1);
    }
  };
  
  const startEditing = (index, product) => {
      setEditingIndex(index);
      setEditProductName(product.productName);
  };
  
  const saveEdit = async () => {
      if (!editProductName.trim()) {
          toast.error("Product name cannot be empty.");
          return;
      }
      
      const updated = [...products];
      updated[editingIndex] = {
          ...updated[editingIndex],
          productName: editProductName.trim()
      };
      
      const success = await syncChanges(updated);
      if (success) {
          setEditingIndex(-1);
          toast.success("Product updated successfully");
      }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto animate-fadeIn">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-theme-navy tracking-tight">Shop Products Collection</h1>
        <p className="text-theme-slate/80 mt-2 text-sm max-w-md">Manage the base products for your walk-in lead generation tools. Changes are saved automatically.</p>
      </header>

      <div className="glass-panel p-6 sm:p-10 rounded-3xl animate-fadeIn">
        <div className="space-y-8">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-theme-accent/5 rounded-xl text-theme-accent border border-theme-accent/10">
                <Store size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-theme-navy tracking-tight">Inventory List</h2>
                <div className="flex items-center gap-2">
                   <p className="text-[11px] text-theme-slate/60 font-medium tracking-tight">
                    {products.length} Items in Catalog
                   </p>
                   {isSyncing && (
                     <div className="flex items-center gap-1 animate-pulse">
                        <Loader2 size={10} className="animate-spin text-theme-accent" />
                        <span className="text-[9px] font-bold text-theme-accent uppercase tracking-widest">Syncing</span>
                     </div>
                   )}
                </div>
              </div>
            </div>
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
                  disabled={isSyncing}
                  onChange={(e) => setNewProductName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddProduct()}
                  className="w-full px-4 py-3 rounded-xl border border-white focus:border-theme-accent font-medium text-sm text-theme-navy outline-none transition-all shadow-sm bg-white/70 disabled:opacity-50"
                />
              </div>
              <div className="flex items-center">
                <button
                  onClick={handleAddProduct}
                  disabled={isSyncing}
                  className="w-full md:w-auto px-8 py-3 bg-theme-accent text-white rounded-xl font-semibold text-xs hover:bg-theme-accent/90 transition-all shadow-md shadow-theme-accent/20 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSyncing ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
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
                              disabled={isSyncing}
                              onChange={(e) => setEditProductName(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                              className="w-full max-w-sm px-4 py-2.5 rounded-xl border border-theme-accent/30 focus:border-theme-accent font-semibold text-sm text-theme-navy outline-none shadow-sm bg-white transition-all ring-2 ring-transparent focus:ring-theme-accent/10 disabled:opacity-50"
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
                                        disabled={isSyncing}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-theme-accent text-white hover:bg-theme-accent/90 rounded-xl transition-all font-bold text-xs shadow-md shadow-theme-accent/20 hover:-translate-y-0.5 disabled:opacity-50"
                                    >
                                        {isSyncing ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                        <span>SAVE</span>
                                    </button>
                                    <button
                                        onClick={() => setEditingIndex(-1)}
                                        disabled={isSyncing}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-theme-slate/10 text-theme-slate hover:bg-theme-slate/20 hover:text-theme-navy rounded-xl transition-all font-bold text-xs disabled:opacity-50"
                                    >
                                        <X size={14} />
                                        <span>CANCEL</span>
                                    </button>
                                </>
                             ) : (
                                <>
                                    <button
                                        onClick={() => startEditing(index, product)}
                                        disabled={isSyncing}
                                        className="flex items-center gap-2 px-4 py-2 text-theme-slate/60 hover:text-theme-accent hover:bg-theme-accent/10 rounded-xl transition-colors text-xs font-bold disabled:opacity-50"
                                    >
                                        <Pencil size={14} />
                                        <span className="hidden sm:inline">EDIT</span>
                                    </button>
                                    <button
                                        onClick={() => setDeleteTarget({ index, name: product.productName })}
                                        disabled={isSyncing}
                                        className="flex items-center gap-2 px-4 py-2 text-theme-slate/60 hover:text-theme-error hover:bg-theme-error/10 rounded-xl transition-colors text-xs font-bold disabled:opacity-50"
                                    >
                                        <Trash2 size={14} />
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

      <DeleteConfirmationModal 
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleRemoveProduct}
        isLoading={isSyncing}
        title="Remove Product"
        message={`Are you sure you want to remove "${deleteTarget?.name}"? You can re-add it anytime, but this will affect your catalog.`}
      />
    </div>
  );
}
