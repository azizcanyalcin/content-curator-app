import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Save, Edit, Trash2, X, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

interface FAQManagerProps {
  faqs: FAQ[];
  onFAQsChange: (faqs: FAQ[]) => void;
}

export const FAQManager = ({ faqs, onFAQsChange }: FAQManagerProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [editQuestion, setEditQuestion] = useState("");
  const [editAnswer, setEditAnswer] = useState("");
  const { toast } = useToast();

  const handleAddFAQ = () => {
    if (!newQuestion.trim() || !newAnswer.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in both question and answer fields",
        variant: "destructive",
      });
      return;
    }

    const newFAQ: FAQ = {
      id: Date.now().toString(),
      question: newQuestion.trim(),
      answer: newAnswer.trim(),
    };

    onFAQsChange([...faqs, newFAQ]);
    setNewQuestion("");
    setNewAnswer("");
    setIsAdding(false);
    
    toast({
      title: "FAQ Added",
      description: "New FAQ has been added successfully",
    });
  };

  const handleEditFAQ = (faq: FAQ) => {
    setEditingId(faq.id);
    setEditQuestion(faq.question);
    setEditAnswer(faq.answer);
  };

  const handleSaveEdit = () => {
    if (!editQuestion.trim() || !editAnswer.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in both question and answer fields",
        variant: "destructive",
      });
      return;
    }

    const updatedFAQs = faqs.map(faq =>
      faq.id === editingId
        ? { ...faq, question: editQuestion.trim(), answer: editAnswer.trim() }
        : faq
    );

    onFAQsChange(updatedFAQs);
    setEditingId(null);
    setEditQuestion("");
    setEditAnswer("");
    
    toast({
      title: "FAQ Updated",
      description: "FAQ has been updated successfully",
    });
  };

  const handleDeleteFAQ = (id: string) => {
    const updatedFAQs = faqs.filter(faq => faq.id !== id);
    onFAQsChange(updatedFAQs);
    
    toast({
      title: "FAQ Removed",
      description: "FAQ has been removed successfully",
    });
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
    setNewQuestion("");
    setNewAnswer("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditQuestion("");
    setEditAnswer("");
  };

  return (
    <div className="space-y-4">
      {/* Existing FAQs */}
      {faqs.map((faq) => (
        <Card key={faq.id} className="relative">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              {editingId === faq.id ? (
                <div className="flex-1 space-y-3">
                  <Input
                    value={editQuestion}
                    onChange={(e) => setEditQuestion(e.target.value)}
                    placeholder="Enter question"
                    className="font-medium"
                  />
                  <Textarea
                    value={editAnswer}
                    onChange={(e) => setEditAnswer(e.target.value)}
                    placeholder="Enter answer"
                    className="min-h-[80px]"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveEdit}>
                      <Check className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1">
                    <CardTitle className="text-base font-medium mb-2">
                      {faq.question}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditFAQ(faq)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteFAQ(faq.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          </CardHeader>
        </Card>
      ))}

      {/* Add New FAQ Form */}
      {isAdding && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base">Add New FAQ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Enter your question"
                className="font-medium"
              />
            </div>
            <div>
              <Textarea
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                placeholder="Enter the answer"
                className="min-h-[80px]"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddFAQ}>
                <Save className="h-4 w-4 mr-2" />
                Save FAQ
              </Button>
              <Button variant="outline" onClick={handleCancelAdd}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add FAQ Button */}
      {!isAdding && (
        <Button
          variant="outline"
          onClick={() => setIsAdding(true)}
          className="w-full border-dashed"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add FAQ
        </Button>
      )}

      {faqs.length === 0 && !isAdding && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No FAQs added yet. Click "Add FAQ" to get started.</p>
        </div>
      )}
    </div>
  );
};
