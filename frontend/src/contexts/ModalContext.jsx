import { createContext, useContext, useState } from 'react'
import AlertModal from '../components/ui/AlertModal'
import ConfirmModal from '../components/ui/ConfirmModal'
import InputModal from '../components/ui/InputModal'
import ValidationModal from '../components/ui/ValidationModal'
import { formatValidationErrors } from '../utils/validation'

const ModalContext = createContext()

export function ModalProvider({ children }) {
  const [alertModal, setAlertModal] = useState({ isOpen: false, type: 'info', title: '', message: '', onConfirm: null })
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null, type: 'warning', isLoading: false })
  const [inputModal, setInputModal] = useState({ isOpen: false, title: '', message: '', placeholder: '', onConfirm: null, type: 'text', initialValue: '', isLoading: false })
  const [validationModal, setValidationModal] = useState({ isOpen: false, title: '', errors: '', fields: {} })

  const showAlert = ({ type = 'info', title, message, onConfirm }) => {
    setAlertModal({ isOpen: true, type, title, message, onConfirm })
  }

  const showConfirm = ({ title = 'Confirm Action', message, onConfirm, type = 'warning', isLoading = false }) => {
    setConfirmModal({ isOpen: true, title, message, onConfirm, type, isLoading })
  }

  const showInput = ({ title = 'Input Required', message, placeholder = 'Enter value...', onConfirm, type = 'text', initialValue = '', isLoading = false }) => {
    setInputModal({ isOpen: true, title, message, placeholder, onConfirm, type, initialValue, isLoading })
  }

  const showValidation = ({ title = 'Validation Error', error }) => {
    const validation = formatValidationErrors(error)
    setValidationModal({
      isOpen: true,
      title,
      errors: validation.message,
      fields: validation.fields,
    })
  }

  const closeAlert = () => {
    setAlertModal({ isOpen: false, type: 'info', title: '', message: '', onConfirm: null })
  }

  const closeConfirm = () => {
    setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null, type: 'warning', isLoading: false })
  }

  const closeInput = () => {
    setInputModal({ isOpen: false, title: '', message: '', placeholder: '', onConfirm: null, type: 'text', initialValue: '', isLoading: false })
  }

  const closeValidation = () => {
    setValidationModal({ isOpen: false, title: '', errors: '', fields: {} })
  }

  const setConfirmLoading = (isLoading) => {
    setConfirmModal(prev => ({ ...prev, isLoading }))
  }

  const setInputLoading = (isLoading) => {
    setInputModal(prev => ({ ...prev, isLoading }))
  }

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm, showInput, showValidation, setConfirmLoading, setInputLoading }}>
      {children}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={closeAlert}
        type={alertModal.type}
        title={alertModal.title}
        message={alertModal.message}
        onConfirm={alertModal.onConfirm}
      />
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        type={confirmModal.type}
        isLoading={confirmModal.isLoading}
      />
      <InputModal
        isOpen={inputModal.isOpen}
        onClose={closeInput}
        title={inputModal.title}
        message={inputModal.message}
        placeholder={inputModal.placeholder}
        onConfirm={inputModal.onConfirm}
        type={inputModal.type}
        initialValue={inputModal.initialValue}
        isLoading={inputModal.isLoading}
      />
      <ValidationModal
        isOpen={validationModal.isOpen}
        onClose={closeValidation}
        title={validationModal.title}
        errors={validationModal.errors}
        fields={validationModal.fields}
      />
    </ModalContext.Provider>
  )
}

export function useModal() {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error('useModal must be used within ModalProvider')
  }
  return context
}

