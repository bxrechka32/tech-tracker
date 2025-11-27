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
  Paper
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
  Delete
} from '@mui/icons-material';
import './App.css';

// Кастомный хук для localStorage
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(error);
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
      '&:hover': {
        transform: 'translateY(-8px)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
      }
    }}>
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Typography variant="h6" component="h3" sx={{ 
            fontWeight: 600,
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent'
          }}>
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

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
          {tech.description}
        </Typography>

        {tech.category && (
          <Chip 
            label={tech.category} 
            size="small" 
            variant="outlined"
            sx={{ mb: 2 }}
          />
        )}

        {tech.deadline && (
          <Typography variant="caption" color="text.secondary" display="block">
            📅 До: {new Date(tech.deadline).toLocaleDateString()}
          </Typography>
        )}
      </CardContent>

      <Box sx={{ p: 2, pt: 0, display: 'flex', gap: 1, justifyContent: 'space-between' }}>
        <Button
          size="small"
          variant={tech.status === 'completed' ? 'outlined' : 'contained'}
          onClick={() => onStatusChange(tech.id, 
            tech.status === 'completed' ? 'not-started' : 
            tech.status === 'in-progress' ? 'completed' : 'in-progress'
          )}
          sx={{ borderRadius: 3 }}
        >
          {tech.status === 'completed' ? 'Отменить' : 
           tech.status === 'in-progress' ? 'Завершить' : 'Начать'}
        </Button>
        
        <Box>
          <IconButton size="small" onClick={() => onEdit(tech)}>
            <Edit />
          </IconButton>
          <IconButton size="small" onClick={() => onDelete(tech.id)} color="error">
            <Delete />
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
  }, [technology, open]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Название обязательно';
    if (!formData.description.trim()) newErrors.description = 'Описание обязательно';
    if (formData.title.length > 50) newErrors.title = 'Слишком длинное название';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
      onClose();
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ 
          fontWeight: 600,
          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent'
        }}>
          {technology ? 'Редактировать' : 'Новая технология'}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>Название *</Typography>
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
                transition: 'all 0.3s ease'
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
              placeholder="Опишите технологию..."
              rows={3}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: `2px solid ${errors.description ? '#f44336' : '#e0e0e0'}`,
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                resize: 'vertical',
                transition: 'all 0.3s ease'
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
                  outline: 'none'
                }}
              >
                <option value="frontend">Frontend</option>
                <option value="backend">Backend</option>
                <option value="mobile">Mobile</option>
                <option value="devops">DevOps</option>
                <option value="database">Базы данных</option>
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
                  outline: 'none'
                }}
              >
                <option value="beginner">Начинающий</option>
                <option value="intermediate">Средний</option>
                <option value="advanced">Продвинутый</option>
              </select>
            </Box>
          </Box>

          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>Дедлайн</Typography>
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
                outline: 'none'
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
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)'
              }}
            >
              {technology ? 'Обновить' : 'Создать'}
            </Button>
            <Button
              onClick={onClose}
              variant="outlined"
              sx={{ flex: 1, py: 1.5, borderRadius: 3 }}
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
    progress: technologies.length > 0 ? 
      Math.round((technologies.filter(t => t.status === 'completed').length / technologies.length) * 100) : 0
  };

  return (
    <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        📊 Прогресс изучения
      </Typography>
      
      <Box sx={{ mb: 2 }}>
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
              backgroundColor: 'white'
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
            {stats.total - stats.completed - stats.inProgress}
          </Typography>
          <Typography variant="body2">Осталось</Typography>
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
    shape: {
      borderRadius: 12,
    },
  });

  const handleAddTech = (techData) => {
    if (editingTech) {
      setTechnologies(prev => 
        prev.map(tech => tech.id === editingTech.id ? { ...tech, ...techData } : tech)
      );
    } else {
      const newTech = {
        id: Date.now(),
        ...techData,
        status: 'not-started',
        createdAt: new Date().toISOString()
      };
      setTechnologies(prev => [...prev, newTech]);
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
  };

  const handleStatusChange = (techId, newStatus) => {
    setTechnologies(prev => 
      prev.map(tech => tech.id === techId ? { ...tech, status: newStatus } : tech)
    );
  };

  const exportData = () => {
    const data = {
      technologies,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tech-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.technologies) {
            setTechnologies(data.technologies);
          }
        } catch (error) {
          alert('Ошибка при импорте файла');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, minHeight: '100vh' }}>
        {/* Шапка */}
        <AppBar position="static" elevation={2}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
              🚀 TechTracker Pro
            </Typography>
            <IconButton color="inherit" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <LightMode /> : <DarkMode />}
            </IconButton>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ py: 3 }}>
          {/* Навигация */}
          <Paper sx={{ mb: 3, borderRadius: 3 }}>
            <Tabs 
              value={currentTab} 
              onChange={(e, newValue) => setCurrentTab(newValue)}
              variant="fullWidth"
            >
              <Tab icon={<Dashboard />} label="Дашборд" />
              <Tab icon={<List />} label="Технологии" />
              <Tab icon={<Settings />} label="Настройки" />
            </Tabs>
          </Paper>

          {/* Дашборд */}
          {currentTab === 0 && (
            <Box>
              <Stats technologies={technologies} />
              
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Активные технологии
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
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <Typography color="text.secondary">
                    Нет активных технологий. Начните изучать что-то новое! 🎯
                  </Typography>
                </Paper>
              )}
            </Box>
          )}

          {/* Все технологии */}
          {currentTab === 1 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Все технологии ({technologies.length})
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
                <Paper sx={{ p: 6, textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom color="text.secondary">
                    📚 Технологий пока нет
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Добавьте первую технологию для отслеживания прогресса
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
            <Paper sx={{ p: 4 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Настройки приложения
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box>
                  <Typography variant="h6" gutterBottom>Экспорт данных</Typography>
                  <Button variant="outlined" onClick={exportData} disabled={technologies.length === 0}>
                    📥 Экспорт в JSON
                  </Button>
                </Box>

                <Box>
                  <Typography variant="h6" gutterBottom>Импорт данных</Typography>
                  <Button variant="outlined" component="label">
                    📤 Импорт из JSON
                    <input type="file" accept=".json" hidden onChange={importData} />
                  </Button>
                </Box>

                <Box>
                  <Typography variant="h6" gutterBottom>Оформление</Typography>
                  <Button 
                    variant="outlined" 
                    startIcon={darkMode ? <LightMode /> : <DarkMode />}
                    onClick={() => setDarkMode(!darkMode)}
                  >
                    {darkMode ? 'Светлая тема' : 'Тёмная тема'}
                  </Button>
                </Box>

                <Box>
                  <Typography variant="h6" gutterBottom>О приложении</Typography>
                  <Typography variant="body2" color="text.secondary">
                    TechTracker Pro v1.0 • Отслеживайте прогресс изучения технологий
                  </Typography>
                </Box>
              </Box>
            </Paper>
          )}
        </Container>

        {/* Плавающая кнопка */}
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
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)'
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
      </Box>
    </ThemeProvider>
  );
}

export default App;
