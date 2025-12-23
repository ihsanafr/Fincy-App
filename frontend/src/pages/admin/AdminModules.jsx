import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { useModal } from '../../contexts/ModalContext'
import { Table, TableHeader, TableBody, TableRow, TableCell } from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'

function AdminModules() {
  const { showAlert, showConfirm } = useModal()
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingModule, setEditingModule] = useState(null)

  useEffect(() => {
    fetchModules()
  }, [])

  const fetchModules = async () => {
    try {
      const response = await api.get('/admin/modules')
      setModules(response.data)
    } catch (error) {
      console.error('Error fetching modules:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    showConfirm({
      title: 'Delete Module',
      message: 'Are you sure you want to delete this module? This action cannot be undone and will also delete all associated contents and quizzes.',
      type: 'danger',
      onConfirm: async () => {
        try {
          await api.delete(`/admin/modules/${id}`)
          fetchModules()
          showAlert({
            type: 'success',
            title: 'Success',
            message: 'Module deleted successfully',
          })
        } catch (error) {
          console.error('Error deleting module:', error)
          showAlert({
            type: 'error',
            title: 'Error',
            message: 'Failed to delete module',
          })
        }
      },
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
          <p className="mt-4 text-gray-500">Loading modules...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">Learning Modules</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage learning modules and their content
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-medium"
        >
          {showForm ? 'Cancel' : '+ Create New Module'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] animate-fadeInUp">
          <ModuleForm
            editingModule={editingModule}
            onSuccess={() => {
              setShowForm(false)
              setEditingModule(null)
              fetchModules()
            }}
            onCancel={() => {
              setShowForm(false)
              setEditingModule(null)
            }}
          />
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
        {modules.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">No modules yet. Create your first module!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                  <TableCell isHeader className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Title
                  </TableCell>
                  <TableCell isHeader className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Category
                  </TableCell>
                  <TableCell isHeader className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Contents
                  </TableCell>
                  <TableCell isHeader className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Quiz Questions
                  </TableCell>
                  <TableCell isHeader className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Status
                  </TableCell>
                  <TableCell isHeader className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {modules.map((module, index) => (
                  <TableRow 
                    key={module.id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 animate-fadeInUp"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white/90">
                          {module.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                          {module.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <Badge color="info" variant="light">
                        {module.category || 'Uncategorized'}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {module.contents?.length || 0}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {module.quiz?.questions?.length || 0}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        color={module.is_active ? 'success' : 'error'}
                        variant="light"
                      >
                        {module.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2 flex-wrap">
                        <Link
                          to={`/admin/modules/${module.id}/contents`}
                          className="px-3 py-1.5 text-brand-600 bg-brand-50 rounded-lg hover:bg-brand-100 dark:bg-brand-500/15 dark:text-brand-400 dark:hover:bg-brand-500/20 transition-all duration-200 text-xs transform hover:scale-105"
                        >
                          Materials
                        </Link>
                        <Link
                          to={`/admin/modules/${module.id}/quiz`}
                          className="px-3 py-1.5 text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 dark:bg-purple-500/15 dark:text-purple-400 dark:hover:bg-purple-500/20 transition-all duration-200 text-xs transform hover:scale-105"
                        >
                          Quiz
                        </Link>
                        <button
                          onClick={() => {
                            setEditingModule(module)
                            setShowForm(true)
                          }}
                          className="text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-all duration-200 transform hover:scale-110"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(module.id)}
                          className="text-error-600 hover:text-error-700 dark:text-error-400 dark:hover:text-error-300 transition-all duration-200 transform hover:scale-110"
                        >
                          Delete
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}

function ModuleForm({ editingModule, onSuccess, onCancel }) {
  const { showAlert, showValidation } = useModal()
  const [formData, setFormData] = useState({
    title: editingModule?.title || '',
    description: editingModule?.description || '',
    category: editingModule?.category || '',
    order: editingModule?.order || 0,
    is_active: editingModule?.is_active !== undefined ? editingModule.is_active : true,
  })
  const [thumbnail, setThumbnail] = useState(null)
  const [thumbnailPreview, setThumbnailPreview] = useState(editingModule?.thumbnail_url || null)
  const [loading, setLoading] = useState(false)

  // Update form data when editingModule changes
  useEffect(() => {
    if (editingModule) {
      setFormData({
        title: editingModule.title || '',
        description: editingModule.description || '',
        category: editingModule.category || '',
        order: editingModule.order || 0,
        is_active: editingModule.is_active !== undefined ? editingModule.is_active : true,
      })
      setThumbnailPreview(editingModule.thumbnail_url || null)
      setThumbnail(null) // Reset new thumbnail selection
    } else {
      // Reset form for new module
      setFormData({
        title: '',
        description: '',
        category: '',
        order: 0,
        is_active: true,
      })
      setThumbnailPreview(null)
      setThumbnail(null)
    }
  }, [editingModule])

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setThumbnail(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setThumbnailPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const submitData = new FormData()
      
      if (editingModule) {
        // For update: send ALL fields to ensure update works correctly
        // Title - always send
        submitData.append('title', formData.title ? formData.title.trim() : '')
        
        // Description - can be empty
        submitData.append('description', formData.description || '')
        
        // Category - always send
        submitData.append('category', formData.category ? formData.category.trim() : '')
        
        // Order - always send
        submitData.append('order', (formData.order || 0).toString())
        
        // is_active - always send as string '0' or '1'
        submitData.append('is_active', formData.is_active ? '1' : '0')
        
        // Thumbnail - only if new file selected
        if (thumbnail) {
          submitData.append('thumbnail', thumbnail)
        }
        
        // Debug: log FormData contents
        console.log('Updating module:', {
          id: editingModule.id,
          formData: formData
        })
        
        // Debug: log all FormData entries
        for (let pair of submitData.entries()) {
          console.log('FormData:', pair[0], '=', pair[1])
        }

        // IMPORTANT: Use POST + _method=PUT for multipart/form-data.
        // PHP/Laravel often won't parse multipart bodies on real PUT requests.
        submitData.append('_method', 'PUT')
        await api.post(`/admin/modules/${editingModule.id}`, submitData)
      } else {
        // For create: send all required fields
        submitData.append('title', formData.title.trim())
        submitData.append('description', formData.description || '')
        submitData.append('category', formData.category.trim())
        submitData.append('order', formData.order.toString())
        submitData.append('is_active', formData.is_active ? '1' : '0')
        
        // Append thumbnail if provided
        if (thumbnail) {
          submitData.append('thumbnail', thumbnail)
        }

        await api.post('/admin/modules', submitData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
      }
      showAlert({
        type: 'success',
        title: 'Success',
        message: editingModule ? 'Module updated successfully' : 'Module created successfully',
      })
      
      // Reset thumbnail selection (but keep preview if editing)
      setThumbnail(null)
      
      // If thumbnail was uploaded, refresh to get new URL
      if (thumbnail && editingModule) {
        // Preview will be updated from server response after fetchModules
      } else if (!editingModule) {
        // Reset preview for new module
        setThumbnailPreview(null)
      }
      
      onSuccess()
    } catch (error) {
      console.error('Error saving module:', error)
      if (error.response?.status === 422) {
        showValidation({
          title: 'Validation Error',
          error,
        })
      } else {
        showAlert({
          type: 'error',
          title: 'Error',
          message: error.response?.data?.message || 'Failed to save module',
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
        {editingModule ? 'Edit Module' : 'Create New Module'}
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category *
          </label>
          <input
            type="text"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Thumbnail/Cover Image
          </label>
          <div className="space-y-3">
            {thumbnailPreview && (
              <div className="w-full h-48 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700">
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 dark:file:bg-brand-900/20 dark:file:text-brand-400"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Recommended size: 800x600px. Max file size: 2MB
            </p>
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Order
          </label>
          <input
            type="number"
            value={formData.order}
            onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
        </div>
        <div className="md:col-span-2">
          <label className="flex items-center gap-3 cursor-pointer p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-5 h-5 text-brand-600 border-gray-300 rounded focus:ring-brand-500 focus:ring-2 cursor-pointer"
            />
            <div className="flex-1">
              <span className="text-sm font-semibold text-gray-900 dark:text-white block">Module Active</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formData.is_active 
                  ? 'Module will be visible to users' 
                  : 'Module will be hidden from users'}
              </span>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              formData.is_active
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
            }`}>
              {formData.is_active ? 'Active' : 'Inactive'}
            </div>
          </label>
        </div>
      </div>
      <div className="flex items-center justify-end gap-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : editingModule ? 'Update Module' : 'Create Module'}
        </button>
      </div>
    </form>
  )
}

export default AdminModules
