import React, { useState, useEffect } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Grid,
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Fab,
  Dialog,
  Tabs,
  Tab,
  LinearProgress,
  Paper,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Add,
  Dashboard,
  List,
  Settings,
  DarkMode,
  LightMode,
  CheckCircle,
  Schedule,
  RadioButtonUnchecked,
  Edit,
  Delete,
  Download,
  Upload,
  Close
} from '@mui/icons-material';
import './App.css';

// Кастомный хук для localStorage
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  return [storedValue, setValue];
};

// Компонент карточки технологии
const TechCard = ({ tech, onEdit, onDelete, onStatusChange }) => {
  const statusConfig = {
    'not-started': { color: 'default', icon: <RadioButtonUnchecked />, label: 'Не начато' },
    'in-progress': { color: 'warning', icon: <Schedule />, label: 'В процессе' },
    'completed': { color: 'success', icon: <CheckCircle />, label: 'Завершено' }
  };

  const { color, icon, label } = statusConfig[tech.status];

  return (
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      transition: 'all 0.3s ease',
      animation: 'fadeIn 0.5s ease-in-out',
      '&:hover': {
        transform: 'translateY(-8px)',
        boxShadow: '0 16px 40px rgba(0,0,0,0.12)'
      }
    }}>
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Typography variant="h6" component="h3" className="gradient-text" sx={{ fontWeight: 600 }}>
            {tech.title}
          </Typography>
          <Chip 
            icon={icon}
            label={label}
            color={color}
            size="small"
            variant={tech.status === 'completed' ? 'filled' : 'outlined'}
          />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6, minHeight: '48px' }}>
          {tech.description}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          {tech.category && (
            <Chip 
              label={tech.category} 
              size="small" 
              variant="outlined"
            />
          )}
          {tech.difficulty && (
            <Chip 
              label={tech.difficulty === 'beginner' ? '👶 Начинающий' : 
                     tech.difficulty === 'intermediate' ? '🚀 Средний' : '🔥 Продвинутый'} 
              size="small" 
              variant="outlined"
              color={tech.difficulty === 'advanced' ? 'secondary' : 'default'}
            />
          )}
        </Box>

        {tech.deadline && (
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
            📅 До: {new Date(tech.deadline).toLocaleDateString('ru-RU')}
          </Typography>
        )}

        {tech.notes && (
          <Typography variant="caption" color="text.secondary" display="block" sx={{ 
            fontStyle: 'italic',
            borderLeft: '3px solid',
            borderColor: 'primary.main',
            pl: 1,
            mt: 1
          }}>
            {tech.notes}
          </Typography>
        )}
      </CardContent>

      <Box sx={{ p: 2, pt: 0, display: 'flex', gap: 1, justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          size="small"
          variant={tech.status === 'completed' ? 'outlined' : 'contained'}
          onClick={() => onStatusChange(tech.id, 
            tech.status === 'completed' ? 'not-started' : 
            tech.status === 'in-progress' ? 'completed' : 'in-progress'
          )}
          sx={{ borderRadius: 3, flex: 1 }}
        >
          {tech.status === 'completed' ? '↶ Восстановить' : 
           tech.status === 'in-progress' ? '✅ Завершить' : '🚀 Начать'}
        </Button>
        
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton 
            size="small" 
            onClick={() => onEdit(tech)}
            sx={{ 
              '&:hover': { 
                backgroundColor: 'primary.main', 
                color: 'white',
                transform: 'scale(1.1)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            <Edit fontSize="small" />
          </IconButton>
          <IconButton 
            size="small" 
            onClick={() => onDelete(tech.id)}
            color="error"
            sx={{ 
              '&:hover': { 
                transform: 'scale(1.1)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Card>
  );
};

// Компонент формы технологии
const TechForm = ({ open, onClose, onSave, technology }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'frontend',
    difficulty: 'beginner',
    deadline: '',
    resources: [''],
    notes: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (technology) {
      setFormData(technology);
    } else {
      setFormData({
        title: '',
        description: '',
        category: 'frontend',
        difficulty: 'beginner',
        deadline: '',
        resources: [''],
        notes: ''
      });
    }
    setErrors({});
  }, [technology, open]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Название обязательно';
    if (!formData.description.trim()) newErrors.description = 'Описание обязательно';
    if (formData.title.length > 50) newErrors.title = 'Слишком длинное название (макс. 50 символов)';
    if (formData.description.length < 10) newErrors.description = 'Описание слишком короткое (мин. 10 символов)';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" className="gradient-text" sx={{ fontWeight: 600 }}>
            {technology ? '✏️ Редактировать' : '🆕 Новая технология'}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>Название технологии *</Typography>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="React, Node.js, TypeScript..."
              style={{
                width: '100%',
                padding: '12px 16px',
                border: `2px solid ${errors.title ? '#f44336' : '#e0e0e0'}`,
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                transition: 'all 0.3s ease',
                backgroundColor: 'transparent'
              }}
            />
            {errors.title && (
              <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                {errors.title}
              </Typography>
            )}
          </Box>

          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>Описание *</Typography>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Опишите, что это за технология и зачем её изучать..."
              rows={3}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: `2px solid ${errors.description ? '#f44336' : '#e0e0e0'}`,
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                resize: 'vertical',
                transition: 'all 0.3s ease',
                backgroundColor: 'transparent',
                fontFamily: 'inherit'
              }}
            />
            {errors.description && (
              <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                {errors.description}
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>Категория</Typography>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  backgroundColor: 'transparent'
                }}
              >
                <option value="frontend">🎨 Frontend</option>
                <option value="backend">⚙️ Backend</option>
                <option value="mobile">📱 Mobile</option>
                <option value="devops">🔧 DevOps</option>
                <option value="database">🗄️ Базы данных</option>
                <option value="tools">🛠️ Инструменты</option>
              </select>
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>Сложность</Typography>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  backgroundColor: 'transparent'
                }}
              >
                <option value="beginner">👶 Начинающий</option>
                <option value="intermediate">🚀 Средний</option>
                <option value="advanced">🔥 Продвинутый</option>
              </select>
            </Box>
          </Box>

          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>Планируемая дата освоения</Typography>
            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                backgroundColor: 'transparent'
              }}
            />
          </Box>

          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>Заметки</Typography>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Ваши заметки и комментарии..."
              rows={2}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                resize: 'vertical',
                backgroundColor: 'transparent',
                fontFamily: 'inherit'
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              type="submit"
              variant="contained"
              sx={{ 
                flex: 1, 
                py: 1.5,
                borderRadius: 3,
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                fontWeight: 600
              }}
            >
              {technology ? '💾 Обновить' : '✨ Создать'}
            </Button>
            <Button
              onClick={onClose}
              variant="outlined"
              sx={{ flex: 1, py: 1.5, borderRadius: 3, fontWeight: 600 }}
            >
              Отмена
            </Button>
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
};

// Компонент статистики
const Stats = ({ technologies }) => {
  const stats = {
    total: technologies.length,
    completed: technologies.filter(t => t.status === 'completed').length,
    inProgress: technologies.filter(t => t.status === 'in-progress').length,
    notStarted: technologies.filter(t => t.status === 'not-started').length,
    progress: technologies.length > 0 ? 
      Math.round((technologies.filter(t => t.status === 'completed').length / technologies.length) * 100) : 0
  };

  return (
    <Paper sx={{ 
      p: 3, 
      mb: 3, 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
      color: 'white',
      animation: 'fadeIn 0.6s ease-in-out'
    }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
        📊 Прогресс изучения
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Box display="flex" justifyContent="space-between" mb={1}>
          <Typography variant="body2">Общий прогресс</Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>{stats.progress}%</Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={stats.progress} 
          sx={{ 
            height: 10, 
            borderRadius: 5,
            backgroundColor: 'rgba(255,255,255,0.3)',
            '& .MuiLinearProgress-bar': {
              backgroundColor: 'white',
              borderRadius: 5
            }
          }}
        />
      </Box>

      <Grid container spacing={2} sx={{ textAlign: 'center' }}>
        <Grid item xs={3}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.total}</Typography>
          <Typography variant="body2">Всего</Typography>
        </Grid>
        <Grid item xs={3}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50' }}>{stats.completed}</Typography>
          <Typography variant="body2">Завершено</Typography>
        </Grid>
        <Grid item xs={3}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#ff9800' }}>{stats.inProgress}</Typography>
          <Typography variant="body2">В процессе</Typography>
        </Grid>
        <Grid item xs={3}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#9e9e9e' }}>
            {stats.notStarted}
          </Typography>
          <Typography variant="body2">Не начато</Typography>
        </Grid>
      </Grid>
    </Paper>
  );
};

// Главный компонент приложения
function App() {
  const [technologies, setTechnologies] = useLocalStorage('technologies', []);
  const [darkMode, setDarkMode] = useLocalStorage('darkMode', false);
  const [currentTab, setCurrentTab] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTech, setEditingTech] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#2196F3',
      },
      secondary: {
        main: '#FF4081',
      },
      background: {
        default: darkMode ? '#0a1929' : '#f5f5f5',
        paper: darkMode ? '#001e3c' : '#ffffff',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", sans-serif',
      h4: {
        fontWeight: 700,
      },
      h6: {
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid rgba(0,0,0,0.04)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
          },
        },
      },
    },
  });

  const handleAddTech = (techData) => {
    if (editingTech) {
      setTechnologies(prev => 
        prev.map(tech => tech.id === editingTech.id ? { ...tech, ...techData } : tech)
      );
      showSnackbar('✅ Технология обновлена!');
    } else {
      const newTech = {
        id: Date.now(),
        ...techData,
        status: 'not-started',
        createdAt: new Date().toISOString()
      };
      setTechnologies(prev => [...prev, newTech]);
      showSnackbar('✨ Новая технология добавлена!');
    }
    setFormOpen(false);
    setEditingTech(null);
  };

  const handleEditTech = (tech) => {
    setEditingTech(tech);
    setFormOpen(true);
  };

  const handleDeleteTech = (techId) => {
    setTechnologies(prev => prev.filter(tech => tech.id !== techId));
    showSnackbar('🗑️ Технология удалена', 'info');
  };

  const handleStatusChange = (techId, newStatus) => {
    setTechnologies(prev => 
      prev.map(tech => tech.id === techId ? { ...tech, status: newStatus } : tech)
    );
    
    const statusMessages = {
      'completed': '🎉 Поздравляем с завершением!',
      'in-progress': '🚀 Отличное начало!',
      'not-started': '↶ Статус сброшен'
    };
    
    showSnackbar(statusMessages[newStatus], 'success');
  };

  const exportData = () => {
    const data = {
      version: '1.0',
      technologies,
      exportedAt: new Date().toISOString(),
      stats: {
        total: technologies.length,
        completed: technologies.filter(t => t.status === 'completed').length
      }
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tech-tracker-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showSnackbar('📥 Данные экспортированы!');
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.technologies && Array.isArray(data.technologies)) {
          setTechnologies(data.technologies);
          showSnackbar(`📤 Импортировано ${data.technologies.length} технологий!`);
        } else {
          showSnackbar('❌ Неверный формат файла', 'error');
        }
      } catch (error) {
        showSnackbar('❌ Ошибка при импорте файла', 'error');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const clearAllData = () => {
    if (window.confirm('Вы уверены, что хотите удалить все данные? Это действие нельзя отменить.')) {
      setTechnologies([]);
      showSnackbar('🧹 Все данные очищены', 'info');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        {/* Шапка */}
        <AppBar position="static" elevation={2} sx={{ background: 'rgba(255,255,255,0.95)', color: 'text.primary' }}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
              <span className="gradient-text">🚀 TechTracker Pro</span>
            </Typography>
            <IconButton 
              color="inherit" 
              onClick={() => setDarkMode(!darkMode)}
              sx={{
                '&:hover': { 
                  transform: 'scale(1.1)',
                  backgroundColor: 'rgba(0,0,0,0.1)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              {darkMode ? <LightMode /> : <DarkMode />}
            </IconButton>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ py: 3 }}>
          {/* Навигация */}
          <Paper sx={{ mb: 3, borderRadius: 3, overflow: 'hidden' }} elevation={2}>
            <Tabs 
              value={currentTab} 
              onChange={(e, newValue) => setCurrentTab(newValue)}
              variant="fullWidth"
              textColor="primary"
              indicatorColor="primary"
            >
              <Tab icon={<Dashboard />} label="Дашборд" />
              <Tab icon={<List />} label={`Технологии (${technologies.length})`} />
              <Tab icon={<Settings />} label="Настройки" />
            </Tabs>
          </Paper>

          {/* Дашборд */}
          {currentTab === 0 && (
            <Box className="fade-in">
              <Stats technologies={technologies} />
              
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                🎯 Активные технологии
              </Typography>

              <Grid container spacing={3}>
                {technologies.filter(tech => tech.status === 'in-progress').map(tech => (
                  <Grid item xs={12} sm={6} md={4} key={tech.id}>
                    <TechCard
                      tech={tech}
                      onEdit={handleEditTech}
                      onDelete={handleDeleteTech}
                      onStatusChange={handleStatusChange}
                    />
                  </Grid>
                ))}
              </Grid>

              {technologies.filter(tech => tech.status === 'in-progress').length === 0 && (
                <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
                  <Typography variant="h6" gutterBottom color="text.secondary">
                    📚 Нет активных технологий
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Начните изучать что-то новое, чтобы увидеть прогресс здесь!
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setFormOpen(true)}
                    sx={{ borderRadius: 3 }}
                  >
                    Добавить технологию
                  </Button>
                </Paper>
              )}
            </Box>
          )}

          {/* Все технологии */}
          {currentTab === 1 && (
            <Box className="fade-in">
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                  📚 Все технологии
                  <Chip label={technologies.length} size="small" color="primary" variant="outlined" />
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => {
                    setEditingTech(null);
                    setFormOpen(true);
                  }}
                  sx={{ 
                    borderRadius: 3,
                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)'
                  }}
                >
                  Добавить
                </Button>
              </Box>

              {technologies.length > 0 && (
                <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip 
                    label={`Все (${technologies.length})`} 
                    variant={currentTab === 1 ? 'filled' : 'outlined'}
                    color="primary"
                  />
                  <Chip 
                    label={`Завершено (${technologies.filter(t => t.status === 'completed').length})`} 
                    variant="outlined"
                    color="success"
                  />
                  <Chip 
                    label={`В процессе (${technologies.filter(t => t.status === 'in-progress').length})`} 
                    variant="outlined"
                    color="warning"
                  />
                  <Chip 
                    label={`Не начато (${technologies.filter(t => t.status === 'not-started').length})`} 
                    variant="outlined"
                  />
                </Box>
              )}

              <Grid container spacing={3}>
                {technologies.map(tech => (
                  <Grid item xs={12} sm={6} md={4} key={tech.id}>
                    <TechCard
                      tech={tech}
                      onEdit={handleEditTech}
                      onDelete={handleDeleteTech}
                      onStatusChange={handleStatusChange}
                    />
                  </Grid>
                ))}
              </Grid>

              {technologies.length === 0 && (
                <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
                  <Typography variant="h4" gutterBottom color="text.secondary" sx={{ mb: 2 }}>
                    🎯
                  </Typography>
                  <Typography variant="h6" gutterBottom color="text.secondary">
                    Технологий пока нет
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Добавьте первую технологию для отслеживания прогресса изучения
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setFormOpen(true)}
                    sx={{ borderRadius: 3 }}
                  >
                    Создать первую технологию
                  </Button>
                </Paper>
              )}
            </Box>
          )}

          {/* Настройки */}
          {currentTab === 2 && (
            <Box className="fade-in">
              <Paper sx={{ p: 4, borderRadius: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  ⚙️ Настройки приложения
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      💾 Управление данными
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Button 
                        variant="outlined" 
                        startIcon={<Download />} 
                        onClick={exportData} 
                        disabled={technologies.length === 0}
                        sx={{ borderRadius: 3 }}
                      >
                        Экспорт в JSON
                      </Button>
                      <Button 
                        variant="outlined" 
                        startIcon={<Upload />} 
                        component="label"
                        sx={{ borderRadius: 3 }}
                      >
                        Импорт из JSON
                        <input type="file" accept=".json" hidden onChange={importData} />
                      </Button>
                      <Button 
                        variant="outlined" 
                        color="error" 
                        onClick={clearAllData}
                        disabled={technologies.length === 0}
                        sx={{ borderRadius: 3 }}
                      >
                        Очистить все
                      </Button>
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      🎨 Оформление
                    </Typography>
                    <Button 
                      variant="outlined" 
                      startIcon={darkMode ? <LightMode /> : <DarkMode />}
                      onClick={() => setDarkMode(!darkMode)}
                      sx={{ borderRadius: 3 }}
                    >
                      {darkMode ? 'Светлая тема' : 'Тёмная тема'}
                    </Button>
                  </Box>

                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      ℹ️ О приложении
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <strong>TechTracker Pro v1.0</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Современное приложение для отслеживания прогресса изучения технологий. 
                      Включает все функции из 26 практических занятий по React.
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Box>
          )}
        </Container>

        {/* Плавающая кнопка добавления */}
        <Fab
          color="primary"
          aria-label="add"
          onClick={() => {
            setEditingTech(null);
            setFormOpen(true);
          }}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            '&:hover': {
              transform: 'scale(1.1)',
              background: 'linear-gradient(45deg, #1976D2 30%, #00ACC1 90%)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          <Add />
        </Fab>

        {/* Модальное окно формы */}
        <TechForm
          open={formOpen}
          onClose={() => {
            setFormOpen(false);
            setEditingTech(null);
          }}
          onSave={handleAddTech}
          technology={editingTech}
        />

        {/* Уведомления */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Alert 
            severity={snackbar.severity} 
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            sx={{ borderRadius: 3 }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

export default App;
