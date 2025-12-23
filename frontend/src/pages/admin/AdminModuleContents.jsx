import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import api from '../../services/api'
import { useModal } from '../../contexts/ModalContext'
import { Table, TableHeader, TableBody, TableRow, TableCell } from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import RichTextEditor from '../../components/RichTextEditor'

function AdminModuleContents() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showAlert, showConfirm } = useModal()
  const [module, setModule] = useState(null)
  const [contents, setContents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingContent, setEditingContent] = useState(null)

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    try {
      const [moduleRes, contentsRes] = await Promise.all([
        api.get(`/admin/modules/${id}`),
        api.get(`/admin/modules/${id}/contents`),
      ])
      setModule(moduleRes.data)
      setContents(contentsRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (contentId) => {
    showConfirm({
      title: 'Delete Learning Material',
      message: 'Are you sure you want to delete this content? This action cannot be undone.',
      type: 'danger',
      onConfirm: async () => {
        try {
          await api.delete(`/admin/modules/${id}/contents/${contentId}`)
          fetchData()
          showAlert({
            type: 'success',
            title: 'Success',
            message: 'Learning material deleted successfully',
          })
        } catch (error) {
          console.error('Error deleting content:', error)
          showAlert({
            type: 'error',
            title: 'Error',
            message: 'Failed to delete content',
          })
        }
      },
    })
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = contents.findIndex((item) => item.id === active.id)
    const newIndex = contents.findIndex((item) => item.id === over.id)

    const newContents = arrayMove(contents, oldIndex, newIndex)
    
    // Update order based on new position
    const updatedContents = newContents.map((content, index) => ({
      ...content,
      order: index,
    }))

    // Optimistically update UI
    setContents(updatedContents)

    try {
      // Update all orders in backend
      await Promise.all(
        updatedContents.map((content) =>
          api.put(`/admin/modules/${id}/contents/${content.id}`, {
            order: content.order,
          })
        )
      )
      
      showAlert({
        type: 'success',
        title: 'Success',
        message: 'Order updated successfully',
      })
    } catch (error) {
      console.error('Error updating order:', error)
      // Revert on error
      fetchData()
      showAlert({
        type: 'error',
        title: 'Error',
        message: 'Failed to update order. Please try again.',
      })
    }
  }

  const stripHtmlTags = (html) => {
    if (!html) return ''
    const tmp = document.createElement('DIV')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
          <p className="mt-4 text-gray-500">Loading contents...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/admin/modules')}
            className="mb-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            ← Back to Modules
          </button>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            Learning Materials: {module?.title}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage learning materials for this module
          </p>
        </div>
        <button
          onClick={() => {
            setEditingContent(null)
            setShowForm(!showForm)
          }}
          className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-medium"
        >
          {showForm ? 'Cancel' : '+ Add New Material'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <ContentForm
            moduleId={id}
            editingContent={editingContent}
            onSuccess={() => {
              setShowForm(false)
              setEditingContent(null)
              fetchData()
            }}
            onCancel={() => {
              setShowForm(false)
              setEditingContent(null)
            }}
          />
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
        {contents.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No learning materials yet. Add your first material!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                  <TableCell isHeader className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400 w-12">
                    Order
                  </TableCell>
                  <TableCell isHeader className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Title
                  </TableCell>
                  <TableCell isHeader className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Type
                  </TableCell>
                  <TableCell isHeader className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Preview
                  </TableCell>
                  <TableCell isHeader className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={contents.map((c) => c.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                    {contents.map((content, index) => (
                      <SortableRow
                        key={content.id}
                        content={content}
                        index={index}
                        onEdit={() => {
                          setEditingContent(content)
                          setShowForm(true)
                        }}
                        onDelete={() => handleDelete(content.id)}
                        stripHtmlTags={stripHtmlTags}
                      />
                    ))}
                  </tbody>
                </SortableContext>
              </DndContext>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}

function ContentForm({ moduleId, editingContent, onSuccess, onCancel }) {
  const { showAlert, showValidation } = useModal()
  const [formData, setFormData] = useState({
    type: editingContent?.type || 'video',
    title: editingContent?.title || '',
    content: editingContent?.content || '',
    youtube_url: editingContent?.youtube_url || '',
    order: editingContent?.order ?? 0,
  })
  const [loading, setLoading] = useState(false)

  const extractYouTubeId = (url) => {
    if (!url) return ''
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editingContent) {
        await api.put(`/admin/modules/${moduleId}/contents/${editingContent.id}`, formData)
      } else {
        await api.post(`/admin/modules/${moduleId}/contents`, formData)
      }
      showAlert({
        type: 'success',
        title: 'Success',
        message: editingContent ? 'Learning material updated successfully' : 'Learning material created successfully',
      })
      onSuccess()
    } catch (error) {
      console.error('Error saving content:', error)
      if (error.response?.status === 422) {
        showValidation({
          title: 'Validation Error',
          error,
        })
      } else {
        showAlert({
          type: 'error',
          title: 'Error',
          message: error.response?.data?.message || error.response?.data?.error || 'Failed to save content',
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
        {editingContent ? 'Edit Learning Material' : 'Add New Learning Material'}
      </h2>
      
      <div className="grid grid-cols-1 gap-4">
        {/* Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Material Type *
          </label>
          <div className="flex gap-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                value="video"
                checked={formData.type === 'video'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value, content: '', youtube_url: '' })}
                className="w-4 h-4 text-brand-600 border-gray-300 focus:ring-brand-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Video (YouTube)</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                value="text"
                checked={formData.type === 'text'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value, youtube_url: '', content: '' })}
                className="w-4 h-4 text-brand-600 border-gray-300 focus:ring-brand-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Article</span>
            </label>
          </div>
        </div>

        {/* Title */}
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
            placeholder="Enter material title"
          />
        </div>

        {/* Video URL or Article Content */}
        {formData.type === 'video' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              YouTube URL *
            </label>
            <input
              type="url"
              value={formData.youtube_url}
              onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              placeholder="https://www.youtube.com/watch?v=..."
            />
            {formData.youtube_url && extractYouTubeId(formData.youtube_url) && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Preview:</p>
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    className="absolute top-0 left-0 w-full h-full rounded-lg"
                    src={`https://www.youtube.com/embed/${extractYouTubeId(formData.youtube_url)}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Article Content *
            </label>
            <div className="border border-gray-300 rounded-lg overflow-hidden dark:border-gray-700">
              <RichTextEditor
                value={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
                placeholder="Write your article content here..."
              />
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              You can format text, add images, and adjust alignment. Click the image icon to upload images.
            </p>
          </div>
        )}

        {/* Order */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Display Order
          </label>
          <input
            type="number"
            value={formData.order}
            onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Lower numbers appear first. Leave 0 to add at the end.
          </p>
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
          {loading ? 'Saving...' : editingContent ? 'Update Material' : 'Create Material'}
        </button>
      </div>
    </form>
  )
}

// Sortable Row Component
function SortableRow({ content, index, onEdit, onDelete, stripHtmlTags }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: content.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 ${isDragging ? 'shadow-lg z-10 relative' : ''}`}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors touch-none focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1"
            title="Drag to reorder"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
          </button>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {index + 1}
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-gray-900 dark:text-white/90">
          {content.title}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <Badge
          color={content.type === 'video' ? 'error' : 'info'}
          variant="light"
        >
          {content.type === 'video' ? 'Video' : 'Article'}
        </Badge>
      </td>
      <td className="px-6 py-4">
        {content.type === 'video' ? (
          <a
            href={content.youtube_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
          >
            {content.youtube_url ? 'View on YouTube' : '-'}
          </a>
        ) : (
          <div className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 max-w-md">
            {content.content ? (
              stripHtmlTags(content.content).substring(0, 100) + 
              (stripHtmlTags(content.content).length > 100 ? '...' : '')
            ) : (
              <span className="text-gray-400 dark:text-gray-500">-</span>
            )}
          </div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onEdit}
            className="text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="text-error-600 hover:text-error-700 dark:text-error-400 dark:hover:text-error-300 transition-colors"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  )
}

export default AdminModuleContents

