import { useRef, useMemo } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import api from '../services/api'
import { useModal } from '../contexts/ModalContext'
import './RichTextEditor.css'

function RichTextEditor({ value, onChange, placeholder = 'Write your content here...' }) {
  const quillRef = useRef(null)
  const { showAlert } = useModal()

  const imageHandler = () => {
    const input = document.createElement('input')
    input.setAttribute('type', 'file')
    input.setAttribute('accept', 'image/*')
    input.click()

    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        showAlert({
          type: 'warning',
          title: 'File Too Large',
          message: 'Image size must be less than 5MB',
        })
        return
      }

      // Validate file type
      if (!file.type.match('image.*')) {
        showAlert({
          type: 'warning',
          title: 'Invalid File Type',
          message: 'Please select an image file',
        })
        return
      }

      try {
        const formData = new FormData()
        formData.append('image', file)

        const response = await api.post('/admin/content/upload-image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })

        const imageUrl = response.data.url
        const quill = quillRef.current?.getEditor()
        const range = quill?.getSelection()

        if (range) {
          quill.insertEmbed(range.index, 'image', imageUrl)
          quill.setSelection(range.index + 1)
        }
      } catch (error) {
        console.error('Error uploading image:', error)
        showAlert({
          type: 'error',
          title: 'Upload Failed',
          message: 'Failed to upload image. Please try again.',
        })
      }
    }
  }

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          [{ size: ['small', false, 'large', 'huge'] }],
          [{ font: [] }],
          [{ align: [] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ color: [] }, { background: [] }],
          [{ script: 'sub' }, { script: 'super' }],
          ['blockquote', 'code-block'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ indent: '-1' }, { indent: '+1' }],
          ['link', 'image', 'video'],
          ['clean'],
        ],
        handlers: {
          image: imageHandler,
        },
      },
      clipboard: {
        matchVisual: false,
      },
    }),
    []
  )

  const formats = [
    'header',
    'size',
    'font',
    'align',
    'bold',
    'italic',
    'underline',
    'strike',
    'color',
    'background',
    'script',
    'blockquote',
    'code-block',
    'list',
    'bullet',
    'indent',
    'link',
    'image',
    'video',
  ]

  return (
    <div className="rich-text-editor">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
    </div>
  )
}

export default RichTextEditor
