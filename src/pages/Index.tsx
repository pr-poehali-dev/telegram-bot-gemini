import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [botUrl, setBotUrl] = useState('https://functions.poehali.dev/861e295d-e4d2-4c04-8eed-157185096a34');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isSettingWebhook, setIsSettingWebhook] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Скопировано!',
      description: 'URL скопирован в буфер обмена',
    });
  };

  const setWebhook = async () => {
    if (!webhookUrl) {
      toast({
        title: 'Ошибка',
        description: 'Введите токен бота',
        variant: 'destructive',
      });
      return;
    }

    setIsSettingWebhook(true);
    try {
      const response = await fetch(
        `https://api.telegram.org/bot${webhookUrl}/setWebhook?url=${encodeURIComponent(botUrl)}`
      );
      const data = await response.json();

      if (data.ok) {
        toast({
          title: 'Успешно!',
          description: 'Webhook установлен. Бот готов к работе!',
        });
      } else {
        toast({
          title: 'Ошибка',
          description: data.description || 'Не удалось установить webhook',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Ошибка подключения к Telegram API',
        variant: 'destructive',
      });
    } finally {
      setIsSettingWebhook(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 mb-4">
            <Icon name="Bot" size={48} className="text-blue-600" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Telegram Бот с Gemini AI
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Интеллектуальный помощник для работы с релизами музыки и клипов
          </p>
        </div>

        {/* Main Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-8">
          {/* Bot Status Card */}
          <Card className="hover-scale">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Zap" size={24} className="text-green-500" />
                  Статус бота
                </CardTitle>
                <Badge variant="default" className="bg-green-500">
                  <Icon name="CheckCircle" size={14} className="mr-1" />
                  Активен
                </Badge>
              </div>
              <CardDescription>Backend функция развёрнута и готова</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  URL функции:
                </label>
                <div className="flex gap-2">
                  <Input value={botUrl} readOnly className="font-mono text-sm" />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(botUrl)}
                  >
                    <Icon name="Copy" size={18} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Setup Card */}
          <Card className="hover-scale">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Settings" size={24} className="text-blue-500" />
                Подключение
              </CardTitle>
              <CardDescription>Настройте webhook для Telegram</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Токен бота:
                </label>
                <Input
                  type="password"
                  placeholder="8368172781:AAHJKJ5KPN-s19I3bIFgXMhmbHtP4R6jFdA"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="mb-2"
                />
                <Button
                  onClick={setWebhook}
                  disabled={isSettingWebhook}
                  className="w-full"
                >
                  {isSettingWebhook ? (
                    <>
                      <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                      Устанавливаю...
                    </>
                  ) : (
                    <>
                      <Icon name="Link" size={18} className="mr-2" />
                      Установить Webhook
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-8">
          <Card className="hover-scale">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Icon name="Brain" size={20} className="text-purple-500" />
                Gemini 2.5 Flash
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Мощная AI модель от Google для точных ответов на вопросы о релизах
              </p>
            </CardContent>
          </Card>

          <Card className="hover-scale">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Icon name="Database" size={20} className="text-blue-500" />
                База знаний
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Полная инструкция по отгрузке песен, клипов и видеошотов
              </p>
            </CardContent>
          </Card>

          <Card className="hover-scale">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Icon name="Search" size={20} className="text-green-500" />
                Поиск в сети
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Автоматический поиск информации, если нет ответа в базе
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Commands Card */}
        <Card className="max-w-5xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Terminal" size={24} className="text-gray-700" />
              Команды бота
            </CardTitle>
            <CardDescription>Доступные команды для пользователей</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <Badge variant="secondary" className="font-mono">/help</Badge>
                <p className="text-sm text-gray-700">
                  Показывает справку по всем командам и возможностям бота
                </p>
              </div>
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <Badge variant="secondary" className="font-mono">/info</Badge>
                <p className="text-sm text-gray-700">
                  Информация о боте и его возможностях
                </p>
              </div>
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Badge className="bg-blue-500">💬</Badge>
                <p className="text-sm text-gray-700">
                  <strong>Любой вопрос</strong> — просто напишите вопрос, и бот ответит на основе базы знаний или найдёт информацию в интернете
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Knowledge Base Preview */}
        <Card className="max-w-5xl mx-auto mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="BookOpen" size={24} className="text-orange-500" />
              База знаний
            </CardTitle>
            <CardDescription>Основные темы, которые знает бот</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Icon name="Music" size={20} className="text-purple-500 mt-1" />
                <div>
                  <h3 className="font-semibold text-sm mb-1">Отгрузка песен</h3>
                  <p className="text-sm text-gray-600">Форматы файлов, требования к обложкам, информация по артистам</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Icon name="Video" size={20} className="text-blue-500 mt-1" />
                <div>
                  <h3 className="font-semibold text-sm mb-1">Отгрузка клипов</h3>
                  <p className="text-sm text-gray-600">Технические требования к видео, размеры, форматы</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Icon name="FileText" size={20} className="text-green-500 mt-1" />
                <div>
                  <h3 className="font-semibold text-sm mb-1">Оформление текстов</h3>
                  <p className="text-sm text-gray-600">Правила форматирования, пунктуация, адлибы</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Icon name="Film" size={20} className="text-red-500 mt-1" />
                <div>
                  <h3 className="font-semibold text-sm mb-1">Видеошоты</h3>
                  <p className="text-sm text-gray-600">Технические параметры, рекомендации, запреты</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
