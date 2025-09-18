"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Upload, 
  FileText, 
  X, 
  Camera, 
  Search, 
  Plus,
  CheckCircle,
  AlertCircle,
  ShoppingCart
} from "lucide-react"
import { useDropzone } from 'react-dropzone'
import { useToast } from "@/hooks/use-toast"

interface PrescriptionUploadProps {
  onTestsSelected: (tests: SelectedTest[]) => void
  trigger?: React.ReactNode
}

interface SelectedTest {
  id: string
  name: string
  description: string
  price: number
  category: string
}

interface UploadedFile {
  file: File
  preview: string
  id: string
}

const POPULAR_TESTS = [
  { id: "1", name: "Complete Blood Count (CBC)", description: "Basic blood test", price: 400, category: "Blood Test" },
  { id: "2", name: "Lipid Profile", description: "Cholesterol and lipid levels", price: 600, category: "Blood Test" },
  { id: "3", name: "Thyroid Function Test", description: "TSH, T3, T4 levels", price: 800, category: "Hormone Test" },
  { id: "4", name: "Blood Glucose (Random)", description: "Blood sugar level", price: 200, category: "Blood Test" },
  { id: "5", name: "Liver Function Test", description: "Liver health assessment", price: 700, category: "Blood Test" },
  { id: "6", name: "Kidney Function Test", description: "Creatinine, BUN, eGFR", price: 500, category: "Blood Test" },
  { id: "7", name: "Vitamin D Test", description: "Vitamin D3 levels", price: 900, category: "Vitamin Test" },
  { id: "8", name: "HbA1c Test", description: "3-month glucose average", price: 450, category: "Diabetes Test" },
]

const TEST_CATEGORIES = ["Blood Test", "Hormone Test", "Vitamin Test", "Diabetes Test", "Cardiac Test", "Imaging"]

export default function PrescriptionUpload({ onTestsSelected, trigger }: PrescriptionUploadProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("browse")
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [selectedTests, setSelectedTests] = useState<SelectedTest[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [prescriptionNotes, setPrescriptionNotes] = useState("")
  const [uploading, setUploading] = useState(false)
  
  const { toast } = useToast()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9)
    }))
    
    setUploadedFiles(prev => [...prev, ...newFiles])
    
    toast({
      title: "Files uploaded",
      description: `${acceptedFiles.length} file(s) uploaded successfully`,
    })
  }, [toast])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 5,
    maxSize: 10 * 1024 * 1024 // 10MB
  })

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => {
      const newFiles = prev.filter(f => f.id !== fileId)
      // Revoke the object URL to free memory
      const fileToRemove = prev.find(f => f.id === fileId)
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview)
      }
      return newFiles
    })
  }

  const toggleTestSelection = (test: SelectedTest) => {
    setSelectedTests(prev => {
      const isSelected = prev.some(t => t.id === test.id)
      if (isSelected) {
        return prev.filter(t => t.id !== test.id)
      } else {
        return [...prev, test]
      }
    })
  }

  const filteredTests = POPULAR_TESTS.filter(test => {
    const matchesSearch = test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         test.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || test.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleContinue = async () => {
    if (activeTab === "prescription" && uploadedFiles.length === 0) {
      toast({
        title: "Upload Required",
        description: "Please upload at least one prescription image",
        variant: "destructive"
      })
      return
    }

    if (activeTab === "browse" && selectedTests.length === 0) {
      toast({
        title: "Tests Required",
        description: "Please select at least one test",
        variant: "destructive"
      })
      return
    }

    if (activeTab === "prescription") {
      // In a real app, you would upload files to a server here
      setUploading(true)
      
      // Simulate upload delay
      setTimeout(() => {
        setUploading(false)
        toast({
          title: "Prescription uploaded",
          description: "Our team will review and suggest appropriate tests",
        })
        
        // For demo, auto-select some common tests
        const suggestedTests = POPULAR_TESTS.slice(0, 3)
        onTestsSelected(suggestedTests)
        setIsOpen(false)
      }, 2000)
    } else {
      onTestsSelected(selectedTests)
      setIsOpen(false)
    }
  }

  const getTotalAmount = () => {
    return selectedTests.reduce((total, test) => total + test.price, 0)
  }

  const renderPrescriptionTab = () => (
    <div className="space-y-6">
      <div className="text-center">
        <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Upload Prescription</h3>
        <p className="text-gray-600">
          Upload your doctor's prescription and we'll suggest the appropriate tests
        </p>
      </div>

      {/* File Upload Area */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
        `}
      >
        <input {...getInputProps()} />
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-lg font-medium mb-2">
          {isDragActive ? 'Drop files here' : 'Drag & drop prescription images'}
        </p>
        <p className="text-gray-500 mb-4">or click to browse files</p>
        <Button variant="outline" type="button">
          <Camera className="h-4 w-4 mr-2" />
          Choose Files
        </Button>
        <p className="text-xs text-gray-400 mt-2">
          Supports JPG, PNG, PDF up to 10MB each
        </p>
      </div>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium">Uploaded Files</h4>
          {uploadedFiles.map((file) => (
            <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-sm">{file.file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFile(file.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Additional Notes (Optional)</Label>
        <Textarea
          id="notes"
          placeholder="Any specific instructions or symptoms..."
          value={prescriptionNotes}
          onChange={(e) => setPrescriptionNotes(e.target.value)}
          rows={3}
        />
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Our medical team will review your prescription and suggest appropriate tests within 30 minutes.
        </AlertDescription>
      </Alert>
    </div>
  )

  const renderBrowseTab = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Search className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Browse & Select Tests</h3>
        <p className="text-gray-600">
          Search and select from our comprehensive list of diagnostic tests
        </p>
      </div>

      {/* Search and Filter */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search for tests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap">
          <Badge 
            variant={selectedCategory === "all" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedCategory("all")}
          >
            All Tests
          </Badge>
          {TEST_CATEGORIES.map(category => (
            <Badge 
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Badge>
          ))}
        </div>
      </div>

      {/* Test List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredTests.map((test) => {
          const isSelected = selectedTests.some(t => t.id === test.id)
          return (
            <div
              key={test.id}
              onClick={() => toggleTestSelection(test)}
              className={`
                p-4 border rounded-lg cursor-pointer transition-all
                ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{test.name}</h4>
                    {isSelected && <CheckCircle className="h-5 w-5 text-blue-600" />}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{test.description}</p>
                  <Badge variant="outline" className="mt-2 text-xs">
                    {test.category}
                  </Badge>
                </div>
                <div className="text-right ml-4">
                  <div className="text-lg font-semibold text-blue-600">₹{test.price}</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Selected Tests Summary */}
      {selectedTests.length > 0 && (
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium">Selected Tests ({selectedTests.length})</h4>
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              <span className="font-semibold">₹{getTotalAmount().toLocaleString()}</span>
            </div>
          </div>
          <div className="space-y-2">
            {selectedTests.map((test) => (
              <div key={test.id} className="flex items-center justify-between text-sm">
                <span>{test.name}</span>
                <span>₹{test.price}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  if (trigger) {
    return (
      <>
        <div onClick={() => setIsOpen(true)} className="cursor-pointer">
          {trigger}
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Select Tests</DialogTitle>
              <DialogDescription>
                Choose how you'd like to proceed with your diagnostic tests
              </DialogDescription>
            </DialogHeader>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="browse">Browse Tests</TabsTrigger>
                <TabsTrigger value="prescription">Upload Prescription</TabsTrigger>
              </TabsList>
              
              <TabsContent value="browse" className="mt-6">
                {renderBrowseTab()}
              </TabsContent>
              
              <TabsContent value="prescription" className="mt-6">
                {renderPrescriptionTab()}
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleContinue} 
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    {activeTab === "browse" ? (
                      selectedTests.length > 0 ? `Continue with ${selectedTests.length} test(s)` : "Select Tests"
                    ) : (
                      uploadedFiles.length > 0 ? "Upload & Continue" : "Upload Prescription"
                    )}
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Tests</CardTitle>
        <CardDescription>
          Choose how you'd like to proceed with your diagnostic tests
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="browse">Browse Tests</TabsTrigger>
            <TabsTrigger value="prescription">Upload Prescription</TabsTrigger>
          </TabsList>
          
          <TabsContent value="browse" className="mt-6">
            {renderBrowseTab()}
          </TabsContent>
          
          <TabsContent value="prescription" className="mt-6">
            {renderPrescriptionTab()}
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end gap-3 pt-4 border-t mt-6">
          <Button 
            onClick={handleContinue} 
            disabled={uploading}
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Uploading...
              </>
            ) : (
              <>
                {activeTab === "browse" ? (
                  selectedTests.length > 0 ? `Continue with ${selectedTests.length} test(s)` : "Select Tests"
                ) : (
                  uploadedFiles.length > 0 ? "Upload & Continue" : "Upload Prescription"
                )}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}