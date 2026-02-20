import { useState, useEffect } from 'react';
import { ref, onValue, push } from 'firebase/database';
import { database } from './firebaseConfig';
import { 
  Box, Container, Typography, Paper, Grid, Card, CardContent,
  AppBar, Toolbar, IconButton, Chip, Avatar, Divider,
  ThemeProvider, createTheme, CssBaseline
} from '@mui/material';
import { 
  MusicNote as MusicNoteIcon,
  Devices as DevicesIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  Cloud as CloudIcon,
  Headphones as HeadphonesIcon
} from '@mui/icons-material';
import DeviceManager from './components/DeviceManager';
import PlaybackControls from './components/PlaybackControls';
import SongSearch from './components/SongSearch';
import './App.css';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1DB954',
    },
    background: {
      default: '#0a0a0a',
      paper: 'rgba(26, 26, 46, 0.6)',
    },
  },
});

function App() {
  const [devices, setDevices] = useState({});
  const [selectedDevice, setSelectedDevice] = useState(null);

  useEffect(() => {
    const devicesRef = ref(database, 'devices');
    const unsubscribe = onValue(devicesRef, (snapshot) => {
      const data = snapshot.val();
      setDevices(data || {});
    });

    return () => unsubscribe();
  }, []);

  const handleSendCommand = async (command, deviceId = selectedDevice) => {
    if (!deviceId) return;

    const commandsRef = ref(database, `devices/${deviceId}/commands`);
    await push(commandsRef, {
      action: command.action,
      params: command.params || {},
      timestamp: Date.now()
    });
  };

  const handleBroadcastCommand = async (command) => {
    Object.keys(devices).forEach((deviceId) => {
      handleSendCommand(command, deviceId);
    });
  };

  const deviceCount = Object.keys(devices).length;
  const playingCount = Object.values(devices).filter(d => d.isPlaying).length;
  const onlineCount = Object.values(devices).filter(d => d.online).length;

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box className="app">
        <AppBar position="static" className="app-bar" elevation={0}>
          <Toolbar>
            <Avatar 
              sx={{ mr: 2, bgcolor: '#1DB954', width: 48, height: 48 }}
            >
              <MusicNoteIcon />
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h5" component="h1" fontWeight={700}>
                Brainiak
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Central Spotify Control Panel
              </Typography>
            </Box>
            <Chip 
              icon={<CloudIcon />}
              label="Connected to Firebase"
              color="success"
              size="small"
              sx={{ mr: 1 }}
            />
          <Chip 
            label="Spotify Ready"
            color="success"
            size="small"
          />
          </Toolbar>
        </AppBar>

      <Container maxWidth="xl" className="app-container">
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Card className="stat-card">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <DevicesIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h3" fontWeight={700}>
                        {deviceCount}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Devices
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              <Card className="stat-card">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'success.main' }}>
                      <PlayArrowIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h3" fontWeight={700}>
                        {playingCount}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Now Playing
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              <Card className="stat-card">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'info.main' }}>
                      <HeadphonesIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h3" fontWeight={700}>
                        {onlineCount}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Online
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Grid>

          <Grid item xs={12} lg={4}>
            <DeviceManager
              devices={devices}
              selectedDevice={selectedDevice}
              onSelectDevice={setSelectedDevice}
              onSendCommand={handleSendCommand}
            />
          </Grid>

          <Grid item xs={12} lg={8}>
            {selectedDevice ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <PlaybackControls
                  device={devices[selectedDevice]}
                  onSendCommand={(cmd) => handleSendCommand(cmd, selectedDevice)}
                />
                <SongSearch
                  onAddSong={(song) => handleSendCommand({
                    action: 'add_to_queue',
                    params: { uri: song.uri }
                  })}
                />
              </Box>
            ) : (
              <Card className="broadcast-card">
                <CardContent>
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Avatar 
                      sx={{ 
                        width: 80, 
                        height: 80, 
                        bgcolor: 'primary.main',
                        margin: '0 auto 16px'
                      }}
                    >
                      <DevicesIcon sx={{ fontSize: 40 }} />
                    </Avatar>
                    <Typography variant="h5" fontWeight={600} gutterBottom>
                      Broadcast Controls
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                      Control all connected devices simultaneously
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <IconButton 
                          className="broadcast-button"
                          onClick={() => handleBroadcastCommand({ action: 'play' })}
                          size="large"
                        >
                          <PlayArrowIcon sx={{ fontSize: 32 }} />
                        </IconButton>
                        <Typography variant="caption" display="block" mt={1}>
                          Play All
                        </Typography>
                      </Box>
                      
                      <Box sx={{ textAlign: 'center' }}>
                        <IconButton 
                          className="broadcast-button"
                          onClick={() => handleBroadcastCommand({ action: 'pause' })}
                          size="large"
                        >
                          <PauseIcon sx={{ fontSize: 32 }} />
                        </IconButton>
                        <Typography variant="caption" display="block" mt={1}>
                          Pause All
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
    </ThemeProvider>
  );
}

export default App;
