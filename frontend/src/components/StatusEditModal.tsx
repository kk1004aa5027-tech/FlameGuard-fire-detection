'use client'

import { useState } from 'react'

type StatusEditModalProps = {
  onClose: () => void
  onSave: (status: { status_id: number, description: string, fire_progress: string }) => void
  statusId: number
}

export default function StatusEditModal({ onClose, onSave, statusId }: StatusEditModalProps) {
  const [description, setDescription] = useState('')
  const [fireProgress, setFireProgress] = useState('')

  return (
    <div className="modal" style={{ background: 'white', padding: 20, borderRadius: 8 }}>
      <h2>상태 수정</h2>
      <input
        placeholder="설명"
        value={description}
        onChange={e => setDescription(e.target.value)}
        style={{ display: 'block', marginBottom: 10 }}
      />
      <select value={fireProgress} onChange={e => setFireProgress(e.target.value)} style={{ display: 'block', marginBottom: 10 }}>
        <option value="">선택</option>
        <option value="발생 전">발생 전</option>
        <option value="진행 중">진행 중</option>
        <option value="진화 중">진화 중</option>
        <option value="종료됨">종료됨</option>
      </select>
      <button onClick={() => onSave({ status_id: statusId, description, fire_progress: fireProgress })}>
        저장
      </button>
      <button onClick={onClose} style={{ marginLeft: 10 }}>닫기</button>
    </div>
  )
}
