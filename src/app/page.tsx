'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { LogIn, Package, User, Check, X, ClipboardList, LogOut, Plus, Trash2, Edit3, RotateCcw } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('password123')
  const [error, setError] = useState('')

  // Modal State
  const [isItemModalOpen, setIsItemModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [itemForm, setItemForm] = useState({ name: '', description: '', quantity: 0 })

  // SWR for items
  const { data: items, mutate: mutateItems } = useSWR('/api/items', fetcher, {
    refreshInterval: 3000,
  })

  // SWR for borrow requests
  const { data: requests, mutate: mutateRequests } = useSWR(
    user ? `/api/borrow?userId=${user.id}&role=${user.role}` : null,
    fetcher,
    { refreshInterval: 3000 }
  )

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const filteredItems = items?.filter((item: any) => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredRequests = requests?.filter((req: any) => 
    statusFilter === 'ALL' ? true : req.status === statusFilter
  )

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const res = await fetch('/api/auth', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      headers: { 'Content-Type': 'application/json' },
    })
    const data = await res.json()
    if (res.ok) {
      setUser(data)
    } else {
      setError(data.error)
    }
  }

  const handleLogout = () => {
    setUser(null)
  }

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/items', {
      method: 'POST',
      body: JSON.stringify({ ...itemForm, id: editingItem?.id }),
      headers: { 'Content-Type': 'application/json' },
    })
    if (res.ok) {
      setIsItemModalOpen(false)
      setEditingItem(null)
      setItemForm({ name: '', description: '', quantity: 0 })
      mutateItems()
    }
  }

  const handleDeleteItem = async (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?')) return
    const res = await fetch(`/api/items?id=${id}`, { method: 'DELETE' })
    if (res.ok) mutateItems()
  }

  const handleBorrow = async (itemId: string, quantity: number) => {
    const res = await fetch('/api/borrow', {
      method: 'POST',
      body: JSON.stringify({ userId: user.id, itemId, quantity }),
      headers: { 'Content-Type': 'application/json' },
    })
    if (res.ok) {
      alert('ส่งคำขอยืมเรียบร้อยแล้ว')
      mutateRequests()
    } else {
      const data = await res.json()
      alert(data.error)
    }
  }

  const handleUpdateStatus = async (requestId: string, status: string) => {
    const res = await fetch('/api/borrow', {
      method: 'PATCH',
      body: JSON.stringify({ id: requestId, status }),
      headers: { 'Content-Type': 'application/json' },
    })
    if (res.ok) {
      mutateRequests()
      mutateItems()
    }
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
        <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-10 shadow-xl border border-slate-200">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Package className="h-10 w-10 text-white" />
            </div>
            <h2 className="mt-6 text-3xl font-black tracking-tight text-slate-900">คลังสินค้า</h2>
            <p className="mt-2 text-slate-500 font-medium">กรุณาเข้าสู่ระบบเพื่อดำเนินการต่อ</p>
          </div>
          <form className="mt-8 space-y-5" onSubmit={handleLogin}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">ชื่อผู้ใช้</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm transition-all focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  placeholder="admin หรือ user1"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">รหัสผ่าน</label>
                <input
                  type="password"
                  required
                  className="mt-1 block w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm transition-all focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            {error && (
              <div className="rounded-lg bg-red-50 p-3 border border-red-100">
                <p className="text-sm font-medium text-red-600">{error}</p>
              </div>
            )}
            <button
              type="submit"
              className="group relative flex w-full justify-center rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 active:scale-[0.98]"
            >
              เข้าสู่ระบบ
            </button>
          </form>
          <div className="mt-8 rounded-xl bg-slate-50 p-4 border border-slate-100">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">บัญชีทดสอบ</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-white border border-slate-200">
                <p className="font-bold text-slate-700">Admin</p>
                <p className="text-slate-500 font-mono">admin / password123</p>
              </div>
              <div className="p-2 rounded-lg bg-white border border-slate-200">
                <p className="font-bold text-slate-700">Borrower</p>
                <p className="text-slate-500 font-mono">user1 / password123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Navbar */}
      <nav className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-black tracking-tight text-slate-900">Inventory<span className="text-blue-600">Pro</span></span>
            </div>
            <div className="flex items-center gap-6">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full border border-slate-200">
                <User className="h-4 w-4 text-slate-500" />
                <span className="text-sm font-bold text-slate-700">{user.username}</span>
                <span className="text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 bg-blue-600 text-white rounded-md">
                  {user.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="group flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                <span>ออก</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Items Section */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-slate-900">รายการสินค้า</h3>
                <p className="text-sm font-medium text-slate-500 mt-1">จัดการและยืมสินค้าจากคลังกลาง</p>
              </div>
              {user.role === 'ADMIN' && (
                <button
                  onClick={() => {
                    setEditingItem(null)
                    setItemForm({ name: '', description: '', quantity: 0 })
                    setIsItemModalOpen(true)
                  }}
                  className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white shadow-lg hover:bg-slate-800 transition-all active:scale-95"
                >
                  <Plus className="h-4 w-4" /> เพิ่มใหม่
                </button>
              )}
            </div>

            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="ค้นหาสินค้า..."
                className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3 pl-12 text-sm shadow-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Package className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            </div>
            
            <div className="grid gap-4">
              {filteredItems?.map((item: any) => (
                <div key={item.id} className="group relative overflow-hidden bg-white p-5 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md hover:border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-4">
                      <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                        <Package className="h-6 w-6 text-slate-400 group-hover:text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{item.name}</h4>
                        <p className="text-sm font-medium text-slate-500 leading-tight mt-0.5">{item.description}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex gap-2">
                        {user.role === 'ADMIN' && (
                          <>
                            <button
                              onClick={() => {
                                setEditingItem(item)
                                setItemForm({ name: item.name, description: item.description || '', quantity: item.quantity })
                                setIsItemModalOpen(true)
                              }}
                              className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        <div className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${
                          item.quantity > 5 ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 
                          item.quantity > 0 ? 'bg-amber-50 text-amber-700 border border-amber-100' : 
                          'bg-rose-50 text-rose-700 border border-rose-100'
                        }`}>
                          คงเหลือ {item.quantity}
                        </div>
                      </div>
                      {user.role === 'BORROWER' && item.quantity > 0 && (
                        <button
                          onClick={() => handleBorrow(item.id, 1)}
                          className="w-full rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-all active:scale-95"
                        >
                          ขอยืมเครื่องนี้
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Requests Section */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-2xl">
              <h3 className="text-xl font-black mb-1">
                {user.role === 'ADMIN' ? 'จัดการคำขอ' : 'ประวัติการยืม'}
              </h3>
              <p className="text-slate-400 text-sm font-medium">
                {user.role === 'ADMIN' ? 'อนุมัติหรือปฏิเสธคำขอจากผู้ใช้งาน' : 'ตรวจสอบสถานะรายการที่คุณส่งคำขอ'}
              </p>
              
              <div className="mt-6 space-y-4">
                {requests?.map((req: any) => (
                  <div key={req.id} className="bg-slate-800/50 backdrop-blur rounded-2xl p-4 border border-slate-700/50 transition-colors hover:bg-slate-800">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`h-2 w-2 rounded-full ${
                            req.status === 'PENDING' ? 'bg-amber-400 animate-pulse' :
                            req.status === 'APPROVED' ? 'bg-emerald-400' : 
                            req.status === 'RETURNED' ? 'bg-blue-400' : 'bg-rose-400'
                          }`} />
                          <p className="text-sm font-bold truncate">
                            {user.role === 'ADMIN' ? req.user.username : req.item.name}
                          </p>
                        </div>
                        {user.role === 'ADMIN' && (
                          <p className="text-xs font-bold text-slate-300 mb-1">ยืม: {req.item.name}</p>
                        )}
                        <p className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
                          <ClipboardList className="h-3 w-3" />
                          {new Date(req.createdAt).toLocaleString('th-TH', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tighter border ${
                          req.status === 'PENDING' ? 'bg-amber-400/10 text-amber-400 border-amber-400/20' :
                          req.status === 'APPROVED' ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' : 
                          req.status === 'RETURNED' ? 'bg-blue-400/10 text-blue-400 border-blue-400/20' :
                          'bg-rose-400/10 text-rose-400 border-rose-400/20'
                        }`}>
                          {req.status}
                        </span>
                        
                        <div className="flex gap-2">
                          {user.role === 'ADMIN' && req.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(req.id, 'APPROVED')}
                                className="rounded-lg bg-emerald-500 p-1.5 text-white hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(req.id, 'REJECTED')}
                                className="rounded-lg bg-rose-500 p-1.5 text-white hover:bg-rose-400 transition-colors shadow-lg shadow-rose-500/20"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}
                          {(user.role === 'ADMIN' || user.role === 'BORROWER') && req.status === 'APPROVED' && (
                            <button
                              onClick={() => handleUpdateStatus(req.id, 'RETURNED')}
                              className="flex items-center gap-1 rounded-lg bg-blue-500 px-2 py-1 text-[10px] font-bold text-white hover:bg-blue-400 transition-colors shadow-lg shadow-blue-500/20"
                            >
                              <RotateCcw className="h-3 w-3" /> คืนของ
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {(!requests || requests.length === 0) && (
                  <div className="py-12 text-center">
                    <ClipboardList className="mx-auto h-12 w-12 text-slate-700" />
                    <p className="mt-3 text-slate-500 font-bold text-sm">ไม่มีรายการคำขอยืม</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Item Modal */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
              <h3 className="text-xl font-black">{editingItem ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}</h3>
              <button onClick={() => setIsItemModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSaveItem} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">ชื่อสินค้า</label>
                <input
                  type="text"
                  required
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-sm focus:ring-2 focus:ring-blue-600/20 outline-none transition-all"
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">รายละเอียด</label>
                <textarea
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-sm focus:ring-2 focus:ring-blue-600/20 outline-none transition-all"
                  rows={3}
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">จำนวนคงเหลือ</label>
                <input
                  type="number"
                  required
                  min="0"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-sm focus:ring-2 focus:ring-blue-600/20 outline-none transition-all"
                  value={itemForm.quantity}
                  onChange={(e) => setItemForm({ ...itemForm, quantity: parseInt(e.target.value) })}
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all"
              >
                บันทึกข้อมูล
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
