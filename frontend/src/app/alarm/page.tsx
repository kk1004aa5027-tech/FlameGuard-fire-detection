'use client'

import { useEffect, useState } from 'react'
import StatusEditModal from '../../components/StatusEditModal' // 상대경로
import './alarm.css'

type AlarmItem = {
  message: string
  created_at: string
  result_image?: string
  status_id?: number
  status?: {
    status_id: number
    description: string
    fire_progress: string
    updated_at: string | null
  }
}

export default function AlarmPage() {
  const [alarms, setAlarms] = useState<AlarmItem[]>([])
  const [editingStatusId, setEditingStatusId] = useState<number | null>(null)

  // ✅ 관리자 여부 상태
  const [isAdmin, setIsAdmin] = useState(false)

  // ✅ 쿠키에서 user_role 확인
  useEffect(() => {
    const cookies = document.cookie.split(';').map(cookie => cookie.trim())
    const roleCookie = cookies.find(cookie => cookie.startsWith('user_role='))
    const roleValue = roleCookie?.split('=')[1]
    console.log('👀 user_role:', roleValue)
    setIsAdmin(roleValue === 'admin')
  }, [])

  // 알람 데이터 가져오기
  useEffect(() => {
    fetch('http://localhost:8000/api/alarm/list')
      .then(res => res.json())
      .then(data => {
        const filtered = data.filter(
          (item: AlarmItem) => item.message.toLowerCase() !== 'safe',
        )
        setAlarms(filtered)
      })
      .catch(err => console.error('알림 가져오기 실패:', err))
  }, [])
  const handleSaveStatus = async (statusUpdate: {
  status_id: number
  description: string
  fire_progress: string
}) => {
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

      <div className="section">
        {alarms.length === 0 ? (
          <p>표시할 알림이 없습니다.</p>
        ) : (
          <ol>
            {alarms.map((item, index) => (
              <li key={index} className="notice">
                [{item.message}] ({item.created_at})
                {item.result_image && (
                  <div>
                    <img
  src={`http://localhost:8000/temp/${item.result_image}`}

  alt="감지 이미지"
  width={200}
  onError={e => {
    console.error('이미지 로딩 실패:', e.currentTarget.src)
  }}
/>
                  </div>
                )}
                {item.status && (
                  <div className="status">
                    <p>진행 상황: {item.status.fire_progress}</p>
                    <p>상세 설명: {item.status.description}</p>
                    <p>갱신 시각: {item.status.updated_at || 'N/A'}</p>
                  </div>
                )}
                {/* ✅ 관리자만 상태 수정 버튼 보임 */}
                {isAdmin && item.status?.status_id !== undefined && (
                  <button onClick={() => setEditingStatusId(item.status!.status_id)}>
                    상태 수정
                  </button>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>

      {editingStatusId && (
        <StatusEditModal
          statusId={editingStatusId}
          onClose={() => setEditingStatusId(null)}
          onSave={handleSaveStatus}
        />
      )}

      <button onClick={() => (window.location.href = '/mainboard')}>
        돌아가기
      </button>
    </main>
  )
}
