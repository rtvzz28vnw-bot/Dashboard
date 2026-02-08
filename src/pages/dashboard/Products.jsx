import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Select,
  Option,
  IconButton,
  Tooltip,
  Switch,
  Alert,
  Textarea,
} from "@material-tailwind/react";
import {
  Pencil,
  Trash2,
  Eye,
  Plus,
  Package,
  Search,
  RefreshCw,
  AlertCircle,
  Tag,
  DollarSign,
  Star,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  TrendingUp,
  Filter,
} from "lucide-react";
import Swal from "sweetalert2";

// Centralized API configuration
const API_URL = import.meta.env.VITE_API_URL;

// Utility function to get auth token
const getAuthToken = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Authentication token not found");
  }
  return token;
};

// Product Card Component for Mobile View
const ProductCard = ({ product, onView, onEdit, onToggleStatus, onDelete }) => {
  return (
    <Card className="mb-4 shadow-md hover:shadow-lg transition-shadow">
      <CardBody className="p-4">
        {/* Header with Image */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
            <img
              src={`${API_URL}/${product.image}`}
              alt={product.name}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.onerror = null; // Stop infinite loop
                e.target.style.display = "none"; // Just hide broken images
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <Typography
              variant="small"
              className="font-bold text-blue-gray-800 truncate"
            >
              {product.name}
            </Typography>
            <div className="flex items-center gap-2 mt-1">
              <Chip
                variant="gradient"
                value={product.category}
                size="sm"
                color={product.category === "Cards" ? "blue" : "purple"}
                className="capitalize"
              />
              {product.badge && (
                <Chip variant="ghost" value={product.badge} size="sm" />
              )}
            </div>
          </div>
        </div>

        {/* Price & Stock */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <Typography variant="h6" color="blue" className="font-bold">
              ${product.price}
            </Typography>
            {product.originalPrice && (
              <Typography
                variant="small"
                className="line-through text-gray-500"
              >
                ${product.originalPrice}
              </Typography>
            )}
          </div>
          <Chip
            variant="ghost"
            color={product.inStock ? "green" : "red"}
            value={product.inStock ? "In Stock" : "Out of Stock"}
            size="sm"
            icon={
              product.inStock ? (
                <CheckCircle className="w-3 h-3" />
              ) : (
                <XCircle className="w-3 h-3" />
              )
            }
          />
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
          <Typography variant="small">
            {product.rating} ({product.reviews} reviews)
          </Typography>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outlined"
            color="green"
            onClick={() => onView(product)}
            className="flex-1"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outlined"
            color="blue"
            onClick={() => onEdit(product)}
            className="flex-1"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outlined"
            color={product.isActive ? "red" : "green"}
            onClick={() => onToggleStatus(product.id)}
            className="flex-1"
          >
            {product.isActive ? (
              <XCircle className="h-4 w-4" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
          </Button>
          <Button
            size="sm"
            variant="outlined"
            color="red"
            onClick={() => onDelete(product)}
            className="flex-1"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

export function Products() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Modal states
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    category: "Cards",
    productType: "profile",
    platform: "",
    price: "",
    originalPrice: "",
    image: "",
    rating: 5.0,
    reviews: 0,
    badge: "",
    features: ["", "", ""],
    inStock: true,
    discount: "",
    order: 0,
  });

  useEffect(() => {
    fetchProducts();
  }, [categoryFilter, stockFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();

      const params = new URLSearchParams();
      if (categoryFilter) params.append("category", categoryFilter);
      if (stockFilter !== "") params.append("inStock", stockFilter);
      if (searchQuery) params.append("search", searchQuery);

      const response = await axios.get(
        `${API_URL}/api/products/admin/all?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data.success) {
        setProducts(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setError(
        error.response?.data?.message ||
          "Failed to load products. Please try again.",
      );
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (config) => {
    return Swal.fire({
      ...config,
      customClass: {
        container: "!z-[9999]",
      },
    });
  };

  const handleCreateProduct = async () => {
    // Validation
    if (!formData.name || !formData.price || !formData.image) {
      showAlert({
        icon: "warning",
        title: "Missing Required Fields",
        text: "Name, Price, and Image are required",
        confirmButtonText: "OK",
      });
      return;
    }

    // Filter out empty features
    const filteredFeatures = formData.features.filter((f) => f.trim() !== "");

    if (filteredFeatures.length === 0) {
      showAlert({
        icon: "warning",
        title: "Missing Features",
        text: "Please add at least one feature",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      setActionLoading(true);
      const token = getAuthToken();

      const productData = {
        ...formData,
        features: filteredFeatures,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice
          ? parseFloat(formData.originalPrice)
          : null,
        discount: formData.discount ? parseInt(formData.discount) : null,
      };

      const response = await axios.post(
        `${API_URL}/api/products`,
        productData,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data.success) {
        setOpenCreateModal(false);
        fetchProducts();
        resetForm();
        showAlert({
          icon: "success",
          title: "Product Created!",
          text: "Product has been created successfully",
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
        });
      }
    } catch (error) {
      console.error("Error creating product:", error);
      showAlert({
        icon: "error",
        title: "Error Creating Product",
        text:
          error.response?.data?.message ||
          "An error occurred while creating the product",
        confirmButtonText: "OK",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateProduct = async () => {
    // Validation
    if (!formData.name || !formData.price || !formData.image) {
      showAlert({
        icon: "warning",
        title: "Missing Required Fields",
        text: "Name, Price, and Image are required",
        confirmButtonText: "OK",
      });
      return;
    }

    const filteredFeatures = formData.features.filter((f) => f.trim() !== "");

    if (filteredFeatures.length === 0) {
      showAlert({
        icon: "warning",
        title: "Missing Features",
        text: "Please add at least one feature",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      setActionLoading(true);
      const token = getAuthToken();

      const productData = {
        ...formData,
        features: filteredFeatures,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice
          ? parseFloat(formData.originalPrice)
          : null,
        discount: formData.discount ? parseInt(formData.discount) : null,
      };

      const response = await axios.put(
        `${API_URL}/api/products/${selectedProduct.id}`,
        productData,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data.success) {
        setOpenEditModal(false);
        fetchProducts();
        resetForm();
        showAlert({
          icon: "success",
          title: "Product Updated!",
          text: "Product has been updated successfully",
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
        });
      }
    } catch (error) {
      console.error("Error updating product:", error);
      showAlert({
        icon: "error",
        title: "Error Updating Product",
        text:
          error.response?.data?.message ||
          "An error occurred while updating the product",
        confirmButtonText: "OK",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    try {
      setActionLoading(true);
      const token = getAuthToken();

      const response = await axios.delete(
        `${API_URL}/api/products/${selectedProduct.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data.success) {
        setOpenDeleteModal(false);
        fetchProducts();
        showAlert({
          icon: "success",
          title: "Product Deleted!",
          text: "Product has been deleted successfully",
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
        });
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      showAlert({
        icon: "error",
        title: "Error Deleting Product",
        text:
          error.response?.data?.message ||
          "An error occurred while deleting the product",
        confirmButtonText: "OK",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (productId) => {
    try {
      const token = getAuthToken();

      const response = await axios.patch(
        `${API_URL}/api/products/${productId}/toggle-status`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data.success) {
        fetchProducts();
        showAlert({
          icon: "success",
          title: "Status Updated!",
          text: response.data.message,
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
        });
      }
    } catch (error) {
      console.error("Error toggling product status:", error);
      showAlert({
        icon: "error",
        title: "Error Toggling Status",
        text: error.response?.data?.message || "An error occurred",
        confirmButtonText: "OK",
      });
    }
  };

  const openEditDialog = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name || "",
      category: product.category || "Cards",
      productType: product.productType || "profile",
      platform: product.platform || "",
      price: product.price || "",
      originalPrice: product.originalPrice || "",
      image: product.image || "",
      rating: product.rating || 5.0,
      reviews: product.reviews || 0,
      badge: product.badge || "",
      features: product.features || ["", "", ""],
      inStock: product.inStock !== undefined ? product.inStock : true,
      discount: product.discount || "",
      order: product.order || 0,
    });
    setOpenEditModal(true);
  };

  const openDeleteDialog = (product) => {
    setSelectedProduct(product);
    setOpenDeleteModal(true);
  };

  const openViewDialog = (product) => {
    setSelectedProduct(product);
    setOpenViewModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "Cards",
      productType: "profile",
      platform: "",
      price: "",
      originalPrice: "",
      image: "",
      rating: 5.0,
      reviews: 0,
      badge: "",
      features: ["", "", ""],
      inStock: true,
      discount: "",
      order: 0,
    });
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ""] });
  };

  const removeFeature = (index) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures });
  };

  const handleRetry = () => {
    setError(null);
    fetchProducts();
  };

  // Loading state
  if (loading && !error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <Typography variant="h6" color="blue-gray">
          Loading products...
        </Typography>
      </div>
    );
  }

  return (
    <div className="mt-6 sm:mt-12 mb-8 px-2 sm:px-0">
      <Card className="shadow-xl">
        <CardHeader
          variant="gradient"
          color="blue"
          className="mb-6 sm:mb-8 p-4 sm:p-6 shadow-lg"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              <div>
                <Typography
                  variant="h5"
                  color="white"
                  className="font-bold text-lg sm:text-xl"
                >
                  Products Management
                </Typography>
                <Typography
                  variant="small"
                  color="white"
                  className="font-normal opacity-80 hidden sm:block"
                >
                  Manage all products
                </Typography>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <Chip
                value={`${products.length} products`}
                variant="gradient"
                color="blue-gray"
                size="sm"
                className="font-semibold"
              />
              <Button
                size="sm"
                className="flex items-center gap-2 shadow-lg flex-1 sm:flex-initial"
                onClick={() => {
                  resetForm();
                  setOpenCreateModal(true);
                }}
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Product</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardBody className="px-2 sm:px-6 pt-0 pb-6">
          {/* Error State */}
          {error && (
            <Alert
              color="red"
              icon={<AlertCircle className="h-6 w-6" />}
              className="mb-6"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <Typography variant="h6" color="white" className="mb-1">
                    Error Loading Products
                  </Typography>
                  <Typography color="white" className="font-normal text-sm">
                    {error}
                  </Typography>
                </div>
                <Button
                  size="sm"
                  color="white"
                  variant="text"
                  onClick={handleRetry}
                  className="flex items-center gap-2 flex-shrink-0"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retry
                </Button>
              </div>
            </Alert>
          )}

          {/* Search and Filters */}
          <div className="mb-6">
            <div className="flex gap-2 mb-3">
              <div className="flex-1">
                <Input
                  label="Search products..."
                  icon={<Search className="h-5 w-5" />}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  size="lg"
                />
              </div>
              <Button
                variant="outlined"
                size="lg"
                className="flex items-center gap-2 lg:hidden"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-5 w-5" />
              </Button>
              <Button
                variant="outlined"
                size="lg"
                className="hidden lg:flex items-center gap-2"
                onClick={fetchProducts}
              >
                <Search className="h-5 w-5" />
                Search
              </Button>
            </div>

            {/* Desktop Filters */}
            <div className="hidden lg:grid lg:grid-cols-2 gap-4">
              <Select
                label="Filter by Category"
                value={categoryFilter}
                onChange={(val) => setCategoryFilter(val)}
                size="lg"
              >
                <Option value="">All Categories</Option>
                <Option value="Cards">Cards</Option>
                <Option value="Accessories">Accessories</Option>
                <Option value="Table Stand">Table Stand</Option>
                <Option value="Bracelet">Bracelet</Option>
              </Select>
              <Select
                label="Filter by Stock"
                value={stockFilter}
                onChange={(val) => setStockFilter(val)}
                size="lg"
              >
                <Option value="">All Status</Option>
                <Option value="true">In Stock</Option>
                <Option value="false">Out of Stock</Option>
              </Select>
            </div>

            {/* Mobile Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 gap-3 lg:hidden mt-3 p-3 bg-blue-gray-50 rounded-lg">
                <Select
                  label="Filter by Category"
                  value={categoryFilter}
                  onChange={(val) => setCategoryFilter(val)}
                  size="lg"
                >
                  <Option value="">All Categories</Option>
                  <Option value="Cards">Cards</Option>
                  <Option value="Accessories">Accessories</Option>
                  <Option value="Table Stand">Table Stand</Option>
                  <Option value="Bracelet">Bracelet</Option>
                </Select>
                <Select
                  label="Filter by Stock"
                  value={stockFilter}
                  onChange={(val) => setStockFilter(val)}
                  size="lg"
                >
                  <Option value="">All Status</Option>
                  <Option value="true">In Stock</Option>
                  <Option value="false">Out of Stock</Option>
                </Select>
              </div>
            )}
          </div>

          {/* Products Content */}
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Package className="w-16 h-16 text-blue-gray-300 mb-4" />
              <Typography variant="h6" color="blue-gray" className="mb-2">
                No products found
              </Typography>
              <Typography
                variant="small"
                color="gray"
                className="text-center px-4"
              >
                {searchQuery || categoryFilter || stockFilter !== ""
                  ? "Try adjusting your filters"
                  : "Start by creating your first product"}
              </Typography>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="lg:hidden">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onView={openViewDialog}
                    onEdit={openEditDialog}
                    onToggleStatus={handleToggleStatus}
                    onDelete={openDeleteDialog}
                  />
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full min-w-[640px] table-auto">
                  <thead>
                    <tr>
                      {[
                        { label: "Image", icon: ImageIcon },
                        { label: "Name", icon: Tag },
                        { label: "Category", icon: Filter },
                        { label: "Price", icon: DollarSign },
                        { label: "Rating", icon: Star },
                        { label: "Stock", icon: CheckCircle },
                        { label: "Status", icon: TrendingUp },
                        { label: "Actions", icon: null },
                      ].map((el) => (
                        <th
                          key={el.label}
                          className="border-b border-blue-gray-100 bg-blue-gray-50/50 py-4 px-5 text-left"
                        >
                          <div className="flex items-center gap-2">
                            {el.icon && (
                              <el.icon className="w-4 h-4 text-blue-gray-500" />
                            )}
                            <Typography
                              variant="small"
                              className="text-xs font-bold uppercase text-blue-gray-600"
                            >
                              {el.label}
                            </Typography>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {products.map((product, key) => {
                      const className = `py-4 px-5 ${
                        key === products.length - 1
                          ? ""
                          : "border-b border-blue-gray-50"
                      }`;

                      return (
                        <tr
                          key={product.id}
                          className="hover:bg-blue-gray-50/50 transition-colors"
                        >
                          <td className={className}>
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                              <img
                                src={`${API_URL}/${product.image}`}
                                alt={product.name}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  e.target.onerror = null; // Stop infinite loop
                                  e.target.style.display = "none"; // Just hide broken images
                                }}
                              />
                            </div>
                          </td>

                          <td className={className}>
                            <div>
                              <Typography
                                variant="small"
                                color="blue-gray"
                                className="font-semibold"
                              >
                                {product.name}
                              </Typography>
                              {product.badge && (
                                <Chip
                                  variant="ghost"
                                  value={product.badge}
                                  size="sm"
                                  className="w-fit mt-1"
                                />
                              )}
                            </div>
                          </td>

                          <td className={className}>
                            <Chip
                              variant="gradient"
                              color={
                                product.category === "Cards" ? "blue" : "purple"
                              }
                              value={product.category}
                              className="py-1 px-3 text-xs font-semibold capitalize"
                            />
                          </td>

                          <td className={className}>
                            <div>
                              <Typography
                                variant="small"
                                className="font-bold text-blue-gray-800"
                              >
                                ${product.price}
                              </Typography>
                              {product.originalPrice && (
                                <Typography
                                  variant="small"
                                  className="line-through text-gray-500 text-xs"
                                >
                                  ${product.originalPrice}
                                </Typography>
                              )}
                            </div>
                          </td>

                          <td className={className}>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                              <Typography variant="small">
                                {product.rating}
                              </Typography>
                              <Typography
                                variant="small"
                                className="text-gray-500"
                              >
                                ({product.reviews})
                              </Typography>
                            </div>
                          </td>

                          <td className={className}>
                            <Chip
                              variant="ghost"
                              color={product.inStock ? "green" : "red"}
                              size="sm"
                              value={
                                product.inStock ? "In Stock" : "Out of Stock"
                              }
                              icon={
                                product.inStock ? (
                                  <CheckCircle className="h-4 w-4" />
                                ) : (
                                  <XCircle className="h-4 w-4" />
                                )
                              }
                            />
                          </td>

                          <td className={className}>
                            <Chip
                              variant="ghost"
                              color={product.isActive ? "green" : "red"}
                              size="sm"
                              value={product.isActive ? "Active" : "Inactive"}
                            />
                          </td>

                          <td className={className}>
                            <div className="flex gap-2">
                              <Tooltip content="View Details">
                                <IconButton
                                  size="sm"
                                  variant="outlined"
                                  color="green"
                                  onClick={() => openViewDialog(product)}
                                  className="hover:shadow-md transition-shadow"
                                >
                                  <Eye className="h-4 w-4" />
                                </IconButton>
                              </Tooltip>

                              <Tooltip content="Edit Product">
                                <IconButton
                                  size="sm"
                                  variant="outlined"
                                  color="blue"
                                  onClick={() => openEditDialog(product)}
                                  className="hover:shadow-md transition-shadow"
                                >
                                  <Pencil className="h-4 w-4" />
                                </IconButton>
                              </Tooltip>

                              <Tooltip content="Toggle Status">
                                <IconButton
                                  size="sm"
                                  variant="outlined"
                                  color={product.isActive ? "red" : "green"}
                                  onClick={() => handleToggleStatus(product.id)}
                                  className="hover:shadow-md transition-shadow"
                                >
                                  {product.isActive ? (
                                    <XCircle className="h-4 w-4" />
                                  ) : (
                                    <CheckCircle className="h-4 w-4" />
                                  )}
                                </IconButton>
                              </Tooltip>

                              <Tooltip content="Delete Product">
                                <IconButton
                                  size="sm"
                                  variant="outlined"
                                  color="red"
                                  onClick={() => openDeleteDialog(product)}
                                  className="hover:shadow-md transition-shadow"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </IconButton>
                              </Tooltip>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardBody>
      </Card>

      {/* Create Product Modal */}
      <Dialog
        open={openCreateModal}
        handler={setOpenCreateModal}
        size="md"
        className="shadow-2xl max-h-[90vh] overflow-hidden"
      >
        <DialogHeader className="flex items-center gap-3 border-b border-blue-gray-100 p-4 sm:p-6">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
            <Plus className="w-5 h-5 text-white" />
          </div>
          <Typography
            variant="h5"
            color="blue-gray"
            className="text-lg sm:text-xl"
          >
            Create New Product
          </Typography>
        </DialogHeader>
        <DialogBody divider className="max-h-[50vh] overflow-y-auto p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:gap-5">
            <Input
              label="Product Name *"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              size="lg"
              icon={<Tag className="w-5 h-5" />}
            />

            <Select
              label="Category *"
              value={formData.category}
              onChange={(val) => setFormData({ ...formData, category: val })}
              size="lg"
            >
              <Option value="Cards">Cards</Option>
              <Option value="Accessories">Accessories</Option>
              <Option value="Table Stand">Table Stand</Option>
              <Option value="Bracelet">Bracelet</Option>
            </Select>

            <Select
              label="Product Type *"
              value={formData.productType}
              onChange={(val) => setFormData({ ...formData, productType: val })}
              size="lg"
            >
              <Option value="profile">Profile (Card/Bracelet)</Option>
              <Option value="social_link">Social Media Link</Option>
              <Option value="menu">Digital Menu</Option>
              <Option value="review">Google Review</Option>
            </Select>

            {formData.productType === "social_link" && (
              <Select
                label="Platform *"
                value={formData.platform}
                onChange={(val) => setFormData({ ...formData, platform: val })}
                size="lg"
              >
                <Option value="facebook">Facebook</Option>
                <Option value="instagram">Instagram</Option>
                <Option value="youtube">YouTube</Option>
                <Option value="snapchat">Snapchat</Option>
                <Option value="tiktok">TikTok</Option>
                <Option value="linkedin">LinkedIn</Option>
              </Select>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Price *"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                required
                size="lg"
                icon={<DollarSign className="w-5 h-5" />}
              />
              <Input
                label="Original Price"
                type="number"
                step="0.01"
                value={formData.originalPrice}
                onChange={(e) =>
                  setFormData({ ...formData, originalPrice: e.target.value })
                }
                size="lg"
                icon={<DollarSign className="w-5 h-5" />}
              />
            </div>

            <Input
              label="Image Path *"
              value={formData.image}
              onChange={(e) =>
                setFormData({ ...formData, image: e.target.value })
              }
              required
              size="lg"
              icon={<ImageIcon className="w-5 h-5" />}
              placeholder="products/image.png"
            />

            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Rating"
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={formData.rating}
                onChange={(e) =>
                  setFormData({ ...formData, rating: e.target.value })
                }
                size="lg"
                icon={<Star className="w-5 h-5" />}
              />
              <Input
                label="Reviews"
                type="number"
                value={formData.reviews}
                onChange={(e) =>
                  setFormData({ ...formData, reviews: e.target.value })
                }
                size="lg"
              />
              <Input
                label="Discount %"
                type="number"
                min="0"
                max="100"
                value={formData.discount}
                onChange={(e) =>
                  setFormData({ ...formData, discount: e.target.value })
                }
                size="lg"
              />
            </div>

            <Input
              label="Badge (Optional)"
              value={formData.badge}
              onChange={(e) =>
                setFormData({ ...formData, badge: e.target.value })
              }
              size="lg"
              placeholder="Best Seller, Premium, etc."
            />

            <div>
              <Typography
                variant="small"
                color="blue-gray"
                className="mb-2 font-semibold"
              >
                Features *
              </Typography>
              {formData.features.map((feature, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    placeholder={`Feature ${index + 1}`}
                    size="lg"
                  />
                  {formData.features.length > 1 && (
                    <IconButton
                      size="sm"
                      color="red"
                      variant="outlined"
                      onClick={() => removeFeature(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </IconButton>
                  )}
                </div>
              ))}
              <Button
                size="sm"
                variant="outlined"
                onClick={addFeature}
                className="flex items-center gap-2 mt-2"
              >
                <Plus className="h-4 w-4" />
                Add Feature
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-gray-50 rounded-lg">
              <Typography
                variant="small"
                color="blue-gray"
                className="font-semibold"
              >
                In Stock
              </Typography>
              <Switch
                checked={formData.inStock}
                onChange={(e) =>
                  setFormData({ ...formData, inStock: e.target.checked })
                }
                color="green"
              />
            </div>
          </div>
        </DialogBody>
        <DialogFooter className="gap-2 sm:gap-3 p-4 sm:p-6">
          <Button
            variant="text"
            color="red"
            onClick={() => {
              setOpenCreateModal(false);
              resetForm();
            }}
            disabled={actionLoading}
            className="flex-1 sm:flex-initial"
          >
            Cancel
          </Button>
          <Button
            variant="gradient"
            color="green"
            onClick={handleCreateProduct}
            disabled={actionLoading}
            className="flex items-center justify-center gap-2 flex-1 sm:flex-initial"
          >
            {actionLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            {actionLoading ? "Creating..." : "Create Product"}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Edit Product Modal */}
      <Dialog
        open={openEditModal}
        handler={setOpenEditModal}
        size="md"
        className="shadow-2xl max-h-[90vh] overflow-hidden"
      >
        <DialogHeader className="flex items-center gap-3 border-b border-blue-gray-100 p-4 sm:p-6">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
            <Pencil className="w-5 h-5 text-white" />
          </div>
          <Typography
            variant="h5"
            color="blue-gray"
            className="text-lg sm:text-xl"
          >
            Edit Product
          </Typography>
        </DialogHeader>
        <DialogBody divider className="max-h-[50vh] overflow-y-auto p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:gap-5">
            <Input
              label="Product Name *"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              size="lg"
              icon={<Tag className="w-5 h-5" />}
            />

            <Select
              label="Category *"
              value={formData.category}
              onChange={(val) => setFormData({ ...formData, category: val })}
              size="lg"
            >
              <Option value="Cards">Cards</Option>
              <Option value="Accessories">Accessories</Option>
              <Option value="Table Stand">Table Stand</Option>
              <Option value="Bracelet">Bracelet</Option>
            </Select>

            <Select
              label="Product Type *"
              value={formData.productType}
              onChange={(val) => setFormData({ ...formData, productType: val })}
              size="lg"
            >
              <Option value="profile">Profile (Card/Bracelet)</Option>
              <Option value="social_link">Social Media Link</Option>
              <Option value="menu">Digital Menu</Option>
              <Option value="review">Google Review</Option>
            </Select>

            {formData.productType === "social_link" && (
              <Select
                label="Platform *"
                value={formData.platform}
                onChange={(val) => setFormData({ ...formData, platform: val })}
                size="lg"
              >
                <Option value="facebook">Facebook</Option>
                <Option value="instagram">Instagram</Option>
                <Option value="youtube">YouTube</Option>
                <Option value="snapchat">Snapchat</Option>
                <Option value="tiktok">TikTok</Option>
                <Option value="linkedin">LinkedIn</Option>
              </Select>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Price *"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                required
                size="lg"
                icon={<DollarSign className="w-5 h-5" />}
              />
              <Input
                label="Original Price"
                type="number"
                step="0.01"
                value={formData.originalPrice}
                onChange={(e) =>
                  setFormData({ ...formData, originalPrice: e.target.value })
                }
                size="lg"
                icon={<DollarSign className="w-5 h-5" />}
              />
            </div>

            <Input
              label="Image Path *"
              value={formData.image}
              onChange={(e) =>
                setFormData({ ...formData, image: e.target.value })
              }
              required
              size="lg"
              icon={<ImageIcon className="w-5 h-5" />}
            />

            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Rating"
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={formData.rating}
                onChange={(e) =>
                  setFormData({ ...formData, rating: e.target.value })
                }
                size="lg"
                icon={<Star className="w-5 h-5" />}
              />
              <Input
                label="Reviews"
                type="number"
                value={formData.reviews}
                onChange={(e) =>
                  setFormData({ ...formData, reviews: e.target.value })
                }
                size="lg"
              />
              <Input
                label="Discount %"
                type="number"
                min="0"
                max="100"
                value={formData.discount}
                onChange={(e) =>
                  setFormData({ ...formData, discount: e.target.value })
                }
                size="lg"
              />
            </div>

            <Input
              label="Badge (Optional)"
              value={formData.badge}
              onChange={(e) =>
                setFormData({ ...formData, badge: e.target.value })
              }
              size="lg"
            />

            <div>
              <Typography
                variant="small"
                color="blue-gray"
                className="mb-2 font-semibold"
              >
                Features *
              </Typography>
              {formData.features.map((feature, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    placeholder={`Feature ${index + 1}`}
                    size="lg"
                  />
                  {formData.features.length > 1 && (
                    <IconButton
                      size="sm"
                      color="red"
                      variant="outlined"
                      onClick={() => removeFeature(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </IconButton>
                  )}
                </div>
              ))}
              <Button
                size="sm"
                variant="outlined"
                onClick={addFeature}
                className="flex items-center gap-2 mt-2"
              >
                <Plus className="h-4 w-4" />
                Add Feature
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-gray-50 rounded-lg">
              <Typography
                variant="small"
                color="blue-gray"
                className="font-semibold"
              >
                In Stock
              </Typography>
              <Switch
                checked={formData.inStock}
                onChange={(e) =>
                  setFormData({ ...formData, inStock: e.target.checked })
                }
                color="green"
              />
            </div>
          </div>
        </DialogBody>
        <DialogFooter className="gap-2 sm:gap-3 p-4 sm:p-6">
          <Button
            variant="text"
            color="red"
            onClick={() => {
              setOpenEditModal(false);
              resetForm();
            }}
            disabled={actionLoading}
            className="flex-1 sm:flex-initial"
          >
            Cancel
          </Button>
          <Button
            variant="gradient"
            color="blue"
            onClick={handleUpdateProduct}
            disabled={actionLoading}
            className="flex items-center justify-center gap-2 flex-1 sm:flex-initial"
          >
            {actionLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Pencil className="w-4 h-4" />
            )}
            {actionLoading ? "Updating..." : "Update Product"}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={openDeleteModal}
        handler={setOpenDeleteModal}
        size="sm"
        className="shadow-2xl"
      >
        <DialogHeader className="flex items-center gap-3 border-b border-blue-gray-100 p-4 sm:p-6">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-white" />
          </div>
          <Typography variant="h5" color="red" className="text-lg sm:text-xl">
            Confirm Delete
          </Typography>
        </DialogHeader>
        <DialogBody className="p-4 sm:p-6">
          <Typography className="text-sm sm:text-base">
            Are you sure you want to delete product{" "}
            <strong className="text-blue-gray-900">
              {selectedProduct?.name}
            </strong>
            ? This action cannot be undone.
          </Typography>
        </DialogBody>
        <DialogFooter className="gap-2 sm:gap-3 p-4 sm:p-6">
          <Button
            variant="text"
            color="blue-gray"
            onClick={() => setOpenDeleteModal(false)}
            disabled={actionLoading}
            className="flex-1 sm:flex-initial"
          >
            Cancel
          </Button>
          <Button
            variant="gradient"
            color="red"
            onClick={handleDeleteProduct}
            disabled={actionLoading}
            className="flex items-center justify-center gap-2 flex-1 sm:flex-initial"
          >
            {actionLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            {actionLoading ? "Deleting..." : "Delete Product"}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* View Product Modal */}
      <Dialog
        open={openViewModal}
        handler={setOpenViewModal}
        size="md"
        className="shadow-2xl max-h-[90vh] overflow-hidden"
      >
        <DialogHeader className="flex items-center gap-3 border-b border-blue-gray-100 p-4 sm:p-6">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
            <Eye className="w-5 h-5 text-white" />
          </div>
          <Typography
            variant="h5"
            color="blue-gray"
            className="text-lg sm:text-xl"
          >
            Product Details
          </Typography>
        </DialogHeader>
        <DialogBody divider className="max-h-[60vh] overflow-y-auto p-4 sm:p-6">
          {selectedProduct ? (
            <div className="space-y-4">
              {/* Product Image */}
              <div className="flex justify-center">
                <div className="w-48 h-48 rounded-xl overflow-hidden bg-gray-100 border-2 border-blue-gray-100">
                  <img
                    src={`${API_URL}/${selectedProduct.image}`}
                    alt={selectedProduct.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.onerror = null; // Stop infinite loop
                      e.target.style.display = "none"; // Just hide broken images
                    }}
                  />
                </div>
              </div>

              {/* Basic Info */}
              <div className="p-4 border border-blue-gray-100 rounded-lg">
                <Typography
                  variant="h6"
                  color="blue-gray"
                  className="font-bold mb-3"
                >
                  {selectedProduct.name}
                </Typography>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Chip
                    variant="gradient"
                    color={
                      selectedProduct.category === "Cards" ? "blue" : "purple"
                    }
                    value={selectedProduct.category}
                    size="sm"
                  />
                  {selectedProduct.badge && (
                    <Chip
                      variant="ghost"
                      value={selectedProduct.badge}
                      size="sm"
                    />
                  )}
                  <Chip
                    variant="ghost"
                    color={selectedProduct.inStock ? "green" : "red"}
                    value={
                      selectedProduct.inStock ? "In Stock" : "Out of Stock"
                    }
                    size="sm"
                  />
                  <Chip
                    variant="ghost"
                    color={selectedProduct.isActive ? "green" : "red"}
                    value={selectedProduct.isActive ? "Active" : "Inactive"}
                    size="sm"
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <Typography
                  variant="small"
                  className="font-bold uppercase text-blue-800 mb-3"
                >
                  Pricing
                </Typography>
                <div className="flex items-center gap-3">
                  <Typography variant="h4" color="blue" className="font-bold">
                    ${selectedProduct.price}
                  </Typography>
                  {selectedProduct.originalPrice && (
                    <Typography
                      variant="h6"
                      className="line-through text-gray-500"
                    >
                      ${selectedProduct.originalPrice}
                    </Typography>
                  )}
                  {selectedProduct.discount && (
                    <Chip
                      value={`-${selectedProduct.discount}%`}
                      color="red"
                      size="sm"
                    />
                  )}
                </div>
              </div>

              {/* Rating & Reviews */}
              <div className="p-4 border border-blue-gray-100 rounded-lg">
                <Typography
                  variant="small"
                  className="font-bold uppercase text-blue-gray-600 mb-3"
                >
                  Rating & Reviews
                </Typography>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                  <Typography variant="h6">{selectedProduct.rating}</Typography>
                  <Typography variant="small" className="text-gray-600">
                    ({selectedProduct.reviews} reviews)
                  </Typography>
                </div>
              </div>

              {/* Features */}
              {selectedProduct.features &&
                selectedProduct.features.length > 0 && (
                  <div className="p-4 border border-blue-gray-100 rounded-lg">
                    <Typography
                      variant="small"
                      className="font-bold uppercase text-blue-gray-600 mb-3"
                    >
                      Features
                    </Typography>
                    <ul className="space-y-2">
                      {selectedProduct.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <Typography
                            variant="small"
                            className="text-blue-gray-700"
                          >
                            {feature}
                          </Typography>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Typography>No product selected</Typography>
            </div>
          )}
        </DialogBody>
        <DialogFooter className="gap-2 sm:gap-3 p-4 sm:p-6">
          <Button
            variant="text"
            color="blue-gray"
            onClick={() => setOpenViewModal(false)}
            className="flex-1 sm:flex-initial"
          >
            Close
          </Button>
          <Button
            variant="gradient"
            color="blue"
            onClick={() => {
              setOpenViewModal(false);
              openEditDialog(selectedProduct);
            }}
            className="flex items-center gap-2 flex-1 sm:flex-initial"
          >
            <Pencil className="w-4 h-4" />
            Edit Product
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export default Products;
