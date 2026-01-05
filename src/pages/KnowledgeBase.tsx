import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

interface KnowledgeItem {
  id: number;
  category: string;
  question: string;
  answer: string;
  keywords: string[];
  created_at: string;
}

export default function KnowledgeBase() {
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    category: '',
    question: '',
    answer: '',
    keywords: ''
  });

  useEffect(() => {
    loadKnowledge();
  }, []);

  const loadKnowledge = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/5b10e2db-7f87-41ca-83ce-0a1db7af0e91');
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Error loading knowledge:', error);
    }
  };

  const handleSave = async () => {
    const keywords = formData.keywords.split(',').map(k => k.trim()).filter(Boolean);
    
    try {
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId 
        ? { ...formData, keywords, id: editingId }
        : { ...formData, keywords };
      
      const response = await fetch('https://functions.poehali.dev/5b10e2db-7f87-41ca-83ce-0a1db7af0e91', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      if (response.ok) {
        await loadKnowledge();
        setIsAdding(false);
        setEditingId(null);
        setFormData({ category: '', question: '', answer: '', keywords: '' });
      }
    } catch (error) {
      console.error('Error saving:', error);
      alert('Ошибка при сохранении');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить эту запись?')) return;
    
    try {
      const response = await fetch(
        `https://functions.poehali.dev/5b10e2db-7f87-41ca-83ce-0a1db7af0e91?id=${id}`,
        { method: 'DELETE' }
      );
      
      if (response.ok) {
        await loadKnowledge();
      }
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Ошибка при удалении');
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">База знаний бота</h1>
          <Button onClick={() => setIsAdding(true)}>
            <Icon name="Plus" className="mr-2" />
            Добавить запись
          </Button>
        </div>

        {(isAdding || editingId) && (
          <div className="bg-card p-6 rounded-lg mb-6 border">
            <h2 className="text-xl font-semibold mb-4">
              {isAdding ? 'Новая запись' : 'Редактирование'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Категория</label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Например: Отгрузка песни"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Вопрос</label>
                <Input
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="Что нужно для отгрузки песни?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Ответ</label>
                <Textarea
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  placeholder="Подробный ответ на вопрос..."
                  rows={8}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Ключевые слова (через запятую)
                </label>
                <Input
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  placeholder="песня, трек, релиз, отгрузка"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave}>Сохранить</Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsAdding(false);
                    setEditingId(null);
                    setFormData({ category: '', question: '', answer: '', keywords: '' });
                  }}
                >
                  Отмена
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Icon name="BookOpen" size={48} className="mx-auto mb-4 opacity-50" />
              <p>База знаний пуста. Добавьте первую запись!</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="bg-card p-6 rounded-lg border">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                      {item.category}
                    </span>
                    <h3 className="text-lg font-semibold mt-2">{item.question}</h3>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setEditingId(item.id);
                        setFormData({
                          category: item.category,
                          question: item.question,
                          answer: item.answer,
                          keywords: item.keywords.join(', ')
                        });
                      }}
                    >
                      <Icon name="Pencil" size={16} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground whitespace-pre-wrap mb-3">
                  {item.answer}
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {item.keywords.map((kw, i) => (
                    <span key={i} className="text-xs bg-muted px-2 py-1 rounded">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}