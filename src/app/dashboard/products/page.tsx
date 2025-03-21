"use client";

import { useLoading } from "@/context/LoadingContext";
import { useNotification } from "@/context/NotificationContext";
import { useEffect, useState } from "react";
import { FiPlus } from "react-icons/fi";
import ProductDialog from "@/app/dash_components/ProductDialog";
import { ProductData } from "@/app/dash_components/ProductDialog";
import { FiEdit, FiTrash2 } from "react-icons/fi";

interface Product {
  id: string;
  phoneType: string;
  phoneTypeName: string;
  model: string;
  modelName: string;
  condition: string;
  storage: string;
  color: string;
  colorName: string;
  price: string;
  availability: string;
  createdAt: string;
  sellerId: string;
  sellerBusinessName: string;
}

export default function ProductsPage() {
  const { showLoading, hideLoading } = useLoading();
  const { showSuccess, showError, showDeleteConfirmation } = useNotification();

  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [formattedProductData, setFormattedProductData] = useState<ProductData | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        showLoading();

        // Use the right endpoint to fetch products
        const response = await fetch("/dash_api/phone_model_details");
        const result = await response.json();

        if (!result.success) {
          showError("Error", result.message);
          return;
        }

        setProducts(result.data || []);
      } catch (error) {
        showError("Error", "Failed to load products. Please try again.");
      } finally {
        hideLoading();
      }
    };

    fetchProducts();
  }, []);

  const openDialog = (editMode = false, product: Product | null = null, formattedData: ProductData | null = null) => {
    setIsEditMode(editMode);
    setCurrentProduct(product);
    setFormattedProductData(formattedData);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setIsEditMode(false);
    setCurrentProduct(null);
  };

  const handleSaveProduct = async (formData: ProductData) => {
    try {
      showLoading();

      const method = isEditMode ? "PUT" : "POST";
      const endpoint = isEditMode ? `/dash_api/phone_model_details?id=${currentProduct?.id}` : "/dash_api/phone_model_details";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData), // Send formData directly
      });

      const result = await response.json();

      if (!result.success) {
        showError("Error", result.message);
        return;
      }

      if (isEditMode) {
        setProducts(products.map((product) => (product.id === currentProduct?.id ? result.data : product)));
      } else {
        setProducts([...products, result.data]);
      }

      showSuccess("Success", isEditMode ? "Product updated successfully" : "Product added successfully");
    } catch (error) {
      showError("Error", `Failed to ${isEditMode ? "update" : "save"} product. Please try again.`);
    } finally {
      hideLoading();
    }
  };
  const handleEditProduct = (id: string) => {
    const productToEdit = products.find((product) => product.id === id);
    if (productToEdit) {
      const formattedProduct = {
        phoneType: productToEdit.phoneType,
        modelId: productToEdit.model,
        condition: productToEdit.condition,
        storage: productToEdit.storage,
        color: productToEdit.color,
        price: productToEdit.price,
        availability: productToEdit.availability,
        sellerId: productToEdit.sellerId,
      };

      openDialog(true, productToEdit, formattedProduct);
    }
  };

  const handleDeleteProduct = (id: string) => {
    debugger;
    const performDelete = async () => {
      try {
        showLoading();

        // Updated to use the same endpoint as our API
        const response = await fetch(`/dash_api/phone_model_details?id=${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (!result.success) {
          showError("Error", result.message);
          return;
        }

        setProducts(products.filter((product) => product.id !== id));
      } catch (error) {
        showError("Error", "Failed to delete product. Please try again.");
      } finally {
        hideLoading();
      }
    };

    showDeleteConfirmation(
      "Confirm Deletion",
      "Are you sure you want to delete this product? This action cannot be undone.",
      performDelete
    );
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-black">Products</h1>

        <button
          onClick={() => openDialog()}
          className="flex items-center px-4 py-2.5 bg-black text-white rounded-md hover:bg-[#333333] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#555555] focus:ring-offset-2"
        >
          <FiPlus className="w-5 h-5 mr-2" />
          <span>Add Product</span>
        </button>
      </div>

      <div className="bg-white border border-[#e0e0e0] rounded-md shadow-sm p-6">
        {products.length > 0 ? (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Seller
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Model
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Storage
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Color
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Condition
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Availability
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.sellerBusinessName || "—"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.phoneTypeName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.modelName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.storage}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.colorName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.condition}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${parseFloat(product.price).toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.availability}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditProduct(product.id)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4 flex items-center"
                        >
                          <FiEdit className="w-4 h-4 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-600 hover:text-red-900 flex items-center"
                        >
                          <FiTrash2 className="w-4 h-4 mr-1" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="text-[#999999] text-center py-8">No products found. Add your first product to get started.</p>
        )}
      </div>

      {isDialogOpen && (
        <ProductDialog
          isOpen={isDialogOpen}
          onClose={closeDialog}
          onSave={handleSaveProduct}
          productToEdit={formattedProductData} // Pass the formatted data to dialog
        />
      )}
    </div>
  );
}
