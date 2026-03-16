'use client'

import { useEffect, useState } from 'react'
import StatusEditModal from '@/components/StatusEditModal'

export default function StatusPage() {
  const [alarms, setAlarms] = useState<any[]>([])
  const [editingStatusId, setEditingStatusId] = useState<number | null>(null)

  // 쿠키에서 관리자 여부 확인
  const isAdmin = typeof window !== 'undefined' && document.cookie.includes('user_role=admin')

  useEffect(() => {
    fetch('http://localhost:8000/api/alarm/list')
      .then(res => res.json())
      .then(data => {
        const filtered = data.filter((item: any) => item.message !== 'safe')
        setAlarms(filtered)
      })
      .catch(err => console.error('알람 가져오기 실패:', err))
  }, [])

  const handleSaveStatus = async (statusUpdate: { status_id: number; description: string; fire_progress: string }) => {
    await fetch('http://localhost:8000/api/status/update', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(statusUpdate),
      credentials: 'include',
    })

    setEditingStatusId(null)
    window.location.reload()
  }

  return (
    <main className="container">
      <h1>알림 목록</h1>
      <ol>
        {alarms.map((item, index) => (
          <li key={index}>
            <div>
              [{item.message}] ({item.created_at}) / 진행상태: {item.status?.fire_progress || '없음'}
            </div>
            {item.result_image && (
              <img
                src={`http://localhost:8000/log/${item.result_image}`}
                width={200}
                alt="감지 이미지"
              />
            )}
            {isAdmin && (
              <button onClick={() => setEditingStatusId(item.status?.status_id)}>
                상태 수정
              </button>
            )}
          </li>
        ))}
      </ol>

      {editingStatusId !== null && (
        <StatusEditModal
          statusId={editingStatusId}
          onClose={() => setEditingStatusId(null)}
          onSave={handleSaveStatus}
        />
      )}
    </main>
  )
}