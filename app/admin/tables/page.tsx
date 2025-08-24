"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Eye, 
  Trash2,
  RefreshCw,
  Download,
  Database
} from "lucide-react"
import AdminGuard from "@/components/admin-guard"
import AdminNavigation from "@/components/admin-navigation"

const AVAILABLE_TABLES = [
  { value: "users", label: "Users", description: "System users and accounts" },
  { value: "bookings", label: "Bookings", description: "All appointments and bookings" },
  { value: "services", label: "Services", description: "Available medical services" },
  { value: "centers", label: "Centers", description: "Diagnostic centers" },
  { value: "partners", label: "Partners", description: "Partner organizations" },
  { value: "slots", label: "Slots", description: "Available time slots" },
  { value: "reviews", label: "Reviews", description: "User reviews and ratings" },
  { value: "documents", label: "Documents", description: "Uploaded documents" },
  { value: "notifications", label: "Notifications", description: "System notifications" }
]

export default function AdminTablesPage() {
  const { toast } = useToast()
  const [selectedTable, setSelectedTable] = useState("users")
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRecord, setSelectedRecord] = useState<any>(null)
  const [editRecord, setEditRecord] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  useEffect(() => {
    if (selectedTable) {
      fetchTableData(selectedTable)
    }
  }, [selectedTable])

  const fetchTableData = async (table: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/tables?table=${table}&limit=100`)
      const tableData = await response.json()
      
      if (!response.ok) {
        throw new Error(tableData.error || "Failed to fetch data")
      }
      
      setData(tableData)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch table data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateRecord = async (record: any) => {
    try {
      const response = await fetch("/api/admin/tables", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table: selectedTable, ...record })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update record")
      }

      toast({
        title: "Success",
        description: "Record updated successfully"
      })

      setIsEditDialogOpen(false)
      setEditRecord(null)
      fetchTableData(selectedTable) // Refresh data
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update record",
        variant: "destructive"
      })
    }
  }

  const handleDeleteRecord = async (id: string) => {
    if (!confirm("Are you sure you want to delete this record?")) return

    try {
      const response = await fetch(`/api/admin/tables?table=${selectedTable}&id=${id}`, {
        method: "DELETE"
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete record")
      }

      toast({
        title: "Success",
        description: "Record deleted successfully"
      })

      fetchTableData(selectedTable) // Refresh data
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete record",
        variant: "destructive"
      })
    }
  }

  const exportData = () => {
    const csv = convertToCSV(data)
    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.setAttribute("hidden", "")
    a.setAttribute("href", url)
    a.setAttribute("download", `${selectedTable}_${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return ""
    
    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(","),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header]
          if (typeof value === "object" && value !== null) {
            return `"${JSON.stringify(value).replace(/"/g, '""')}"`
          }
          return `"${String(value || "").replace(/"/g, '""')}"`
        }).join(",")
      )
    ].join("\n")
    
    return csvContent
  }

  const renderCellValue = (value: any, key: string) => {
    if (value === null || value === undefined) return "—"
    
    if (typeof value === "object") {
      return <Badge variant="outline">{JSON.stringify(value)}</Badge>
    }
    
    if (typeof value === "boolean") {
      return <Badge variant={value ? "default" : "outline"}>{value.toString()}</Badge>
    }
    
    if (key.includes("email")) {
      return <code className="text-sm">{value}</code>
    }
    
    if (key.includes("date") || key.includes("time") || key.includes("_at")) {
      return new Date(value).toLocaleString()
    }
    
    if (key === "id") {
      return <code className="text-xs text-gray-500">{value}</code>
    }
    
    return String(value).length > 50 ? String(value).substring(0, 50) + "..." : String(value)
  }

  const filteredData = data.filter(record => {
    if (!searchTerm) return true
    
    return Object.values(record).some(value => 
      String(value || "").toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const tableInfo = AVAILABLE_TABLES.find(t => t.value === selectedTable)

  return (
    <AdminGuard>
      <AdminNavigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0B1B2B] mb-2">Database Tables</h1>
          <p className="text-[#5B6B7A]">View and manage all Supabase table data</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Table: {tableInfo?.label}
                </CardTitle>
                <CardDescription>{tableInfo?.description}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => fetchTableData(selectedTable)}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={exportData}
                  disabled={data.length === 0}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Select value={selectedTable} onValueChange={setSelectedTable}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select table" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_TABLES.map(table => (
                    <SelectItem key={table.value} value={table.value}>
                      {table.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Table */}
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0AA1A7] mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Loading data...</p>
                </div>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {data.length > 0 && Object.keys(data[0]).map(key => (
                        <TableHead key={key} className="font-semibold">
                          {key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                        </TableHead>
                      ))}
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((record, index) => (
                      <TableRow key={record.id || index}>
                        {Object.entries(record).map(([key, value]) => (
                          <TableCell key={key}>
                            {renderCellValue(value, key)}
                          </TableCell>
                        ))}
                        <TableCell>
                          <div className="flex gap-1">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setSelectedRecord(record)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Record Details</DialogTitle>
                                  <DialogDescription>
                                    Viewing record from {tableInfo?.label}
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedRecord && (
                                  <div className="space-y-4">
                                    {Object.entries(selectedRecord).map(([key, value]) => (
                                      <div key={key}>
                                        <Label className="text-sm font-medium">
                                          {key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                                        </Label>
                                        <div className="mt-1 p-2 bg-gray-50 rounded text-sm">
                                          {typeof value === "object" ? 
                                            JSON.stringify(value, null, 2) : 
                                            String(value || "—")
                                          }
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                            
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setEditRecord(record)
                                setIsEditDialogOpen(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteRecord(record.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {filteredData.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No records found
                  </div>
                )}
              </div>
            )}

            <div className="mt-4 text-sm text-gray-500">
              Showing {filteredData.length} of {data.length} records
            </div>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Record</DialogTitle>
              <DialogDescription>
                Make changes to the record in {tableInfo?.label}
              </DialogDescription>
            </DialogHeader>
            {editRecord && (
              <div className="space-y-4">
                {Object.entries(editRecord).map(([key, value]) => (
                  <div key={key}>
                    <Label htmlFor={key} className="text-sm font-medium">
                      {key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                    </Label>
                    {key === "id" ? (
                      <Input 
                        id={key}
                        value={String(value || "")}
                        disabled
                        className="mt-1"
                      />
                    ) : typeof value === "boolean" ? (
                      <Select 
                        value={String(value)}
                        onValueChange={(val) => setEditRecord({...editRecord, [key]: val === "true"})}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">True</SelectItem>
                          <SelectItem value="false">False</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : key.includes("date") || key.includes("_at") ? (
                      <Input 
                        id={key}
                        type="datetime-local"
                        value={value ? new Date(value).toISOString().slice(0, 16) : ""}
                        onChange={(e) => setEditRecord({...editRecord, [key]: e.target.value})}
                        className="mt-1"
                      />
                    ) : (
                      <Textarea
                        id={key}
                        value={typeof value === "object" ? JSON.stringify(value, null, 2) : String(value || "")}
                        onChange={(e) => {
                          try {
                            const parsedValue = JSON.parse(e.target.value)
                            setEditRecord({...editRecord, [key]: parsedValue})
                          } catch {
                            setEditRecord({...editRecord, [key]: e.target.value})
                          }
                        }}
                        className="mt-1"
                        rows={3}
                      />
                    )}
                  </div>
                ))}
                
                <div className="flex gap-2 pt-4">
                  <Button onClick={() => handleUpdateRecord(editRecord)}>
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminGuard>
  )
}
