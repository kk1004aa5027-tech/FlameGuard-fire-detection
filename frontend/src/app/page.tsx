'use client'
import { useState, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'

export default function Home() {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDevice, setSelectedDevice] = useState<string>('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [isPolling, setIsPolling] = useState(false)

  const [audioPermission, setAudioPermission] = useState(false)
  const audioContextRef = useRef<AudioContext | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const sourceNodeRef = useRef<OscillatorNode | null>(null)

  // get camera devices
  useEffect(() => {
    const getDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = devices.filter(
          device => device.kind === 'videoinput',
        )
        setDevices(videoDevices)
        if (videoDevices.length > 0) {
          setSelectedDevice(videoDevices[0].deviceId)
        }
      } catch (error) {
        console.error('failed to get camera devices:', error)
      }
    }
    getDevices()
  }, [])

  // capture video frame and convert to Blob
  const captureFrame = async (
    videoElement: HTMLVideoElement,
  ): Promise<Blob | null> => {
    try {
      if (!videoElement.videoWidth || !videoElement.videoHeight) {
        console.log('video size is invalid')
        return null
      }

      const canvas = document.createElement('canvas')
      canvas.width = videoElement.videoWidth
      canvas.height = videoElement.videoHeight

      const ctx = canvas.getContext('2d')
      if (!ctx) return null

      ctx.drawImage(videoElement, 0, 0)

      return new Promise(resolve => {
        canvas.toBlob(blob => {
          resolve(blob || null)
        }, 'image/jpeg')
      })
    } catch (error) {
      console.error('frame capture error:', error)
      return null
    }
  }

  // send image to server
  const sendFrameToServer = async () => {
    try {
      if (!videoRef.current || !isStreaming) {
        console.log('video is not playing')
        return null
      }

      const blob = await captureFrame(videoRef.current)
      if (!blob) {
        console.log('frame capture failed')
        return null
      }

      const formData = new FormData()
      formData.append('file', blob, 'frame.jpg')

      console.log('sending request to server...')
      const response = await fetch('http://localhost:8000/predict_fire', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      console.log('server response:', data)
      return data
    } catch (error) {
      console.error('server request error:', error)
      return null
    }
  }

  // polling with TanStack Query
  const { data: predictionData } = useQuery({
    queryKey: ['fireDetection', 'fire and smoke detected', 'smoke detected'],
    queryFn: sendFrameToServer,
    enabled: isPolling && isStreaming,
    refetchInterval: 5000,
    retry: false,
  })

  const initAudioContext = async () => {
    try {
      if (!audioPermission) {
        const userConsent = window.confirm(
          'fire alarm requires audio permission. allow?',
        )
        if (!userConsent) {
          return false
        }

        const AudioContext =
          window.AudioContext || (window as any).webkitAudioContext
        audioContextRef.current = new AudioContext()

        // iOS Safari for processing
        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume()
        }

        setAudioPermission(true)
        return true
      }
      return true
    } catch (error) {
      console.error('audio initialization error:', error)
      alert('audio initialization failed.')
      return false
    }
  }

  // stop alert sound
  const stopAlertSound = () => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop()
      sourceNodeRef.current.disconnect()
    }
    if (gainNodeRef.current) {
      gainNodeRef.current.disconnect()
    }
  }

  // alert sound generation and playback
  const playAlertSound = () => {
    if (!audioContextRef.current) return
    stopAlertSound()

    const oscillator = audioContextRef.current.createOscillator()
    gainNodeRef.current = audioContextRef.current.createGain()

    oscillator.type = 'sawtooth'
    oscillator.frequency.setValueAtTime(
      440,
      audioContextRef.current.currentTime,
    )

    // frequency modulation
    oscillator.frequency.setValueAtTime(
      440,
      audioContextRef.current.currentTime,
    )
    oscillator.frequency.linearRampToValueAtTime(
      880,
      audioContextRef.current.currentTime + 0.5,
    )
    oscillator.frequency.linearRampToValueAtTime(
      440,
      audioContextRef.current.currentTime + 1,
    )

    // volume adjustment
    gainNodeRef.current.gain.setValueAtTime(
      0.5,
      audioContextRef.current.currentTime,
    )

    oscillator.connect(gainNodeRef.current)
    gainNodeRef.current.connect(audioContextRef.current.destination)

    oscillator.start()
    sourceNodeRef.current = oscillator //OscillatorNode로 할당
  }
  useEffect(() => {
    const message = predictionData?.message?.toLowerCase()

    const isFire = message === 'fire detected'
    const isSmoke = message === 'smoke detected'
    const isBoth = message === 'fire and smoke detected'

    if (isFire || isSmoke || isBoth) {
      playAlertSound()

      const flashOverlay = document.createElement('div')
      flashOverlay.className =
        'fixed inset-0 pointer-events-none animate-screenFlash'
      document.body.appendChild(flashOverlay)

      const alertElement = document.createElement('div')

      // 배경색 클래스 결정
      let bgColorClass = 'bg-red-500/90'
      if (isSmoke) bgColorClass = 'bg-blue-500/90'
      if (isBoth) bgColorClass = 'bg-purple-600/90'

      alertElement.innerHTML = `
        <div class="flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2c0 6-8 7.5-8 14a8 8 0 0 0 16 0c0-6.5-8-8-8-14z"/>
          </svg>
          <div>
            <div class="font-semibold mb-0.5">${message}</div>
            <div class="text-sm opacity-90">${message}. please check immediately.</div>
          </div>
        </div>
      `

      alertElement.className = `
        fixed bottom-6 right-6 p-4
        ${bgColorClass} text-white
        rounded-xl
        shadow-lg
        backdrop-blur-md
        max-w-[400px] z-[9999]
        font-sans
        animate-slideIn animate-pulse animate-flashBorder
      `

      document.body.appendChild(alertElement)

      const timeout = setTimeout(() => {
        if (document.body.contains(alertElement)) {
          alertElement.classList.remove('animate-slideIn')
          alertElement.classList.add('animate-slideOut')
          flashOverlay.remove()

          setTimeout(() => {
            if (document.body.contains(alertElement)) {
              document.body.removeChild(alertElement)
            }
          }, 500)
        }
      }, 10000)

      return () => {
        clearTimeout(timeout)
        if (document.body.contains(alertElement)) {
          document.body.removeChild(alertElement)
        }
        if (document.body.contains(flashOverlay)) {
          flashOverlay.remove()
        }
      }
    }
  }, [predictionData])

  const startPredict = async () => {
    try {
      const audioInitialized = await initAudioContext()
      if (!audioInitialized) {
        console.log('audio permission denied')
        return
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: selectedDevice },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setIsStreaming(true)
        setIsPolling(true)
        console.log('streaming started')
      }
    } catch (error) {
      console.error('camera access error:', error)
    }
  }

  const stopPredict = () => {
    stopAlertSound()
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach(track => track.stop())
      videoRef.current.srcObject = null
      setIsStreaming(false)
      setIsPolling(false) // stop polling
    }
  }

  console.log('fire detection result:', predictionData)

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900 text-white">
      <div className="space-y-4 w-full max-w-md">
        <motion.select
          value={selectedDevice}
          onChange={e => setSelectedDevice(e.target.value)}
          className="w-full border border-gray-700 p-2 rounded-md shadow-sm bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {devices.map(device => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || `Camera ${device.deviceId.slice(0, 5)}...`}
            </option>
          ))}
        </motion.select>

        {!isStreaming ? (
          <motion.button
            onClick={startPredict}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Stream
          </motion.button>
        ) : (
          <motion.button
            onClick={stopPredict}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-md shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Stop Stream
          </motion.button>
        )}

        <motion.button
          onClick={() => (window.location.href = '/detectionLogs')}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-md shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          View Detection Logs
        </motion.button>
      </div>

      <motion.video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full max-w-md h-auto mt-4 rounded-md shadow-lg bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />
    </div>
  )
}
