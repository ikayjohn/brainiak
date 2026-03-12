import { useState, useEffect } from 'react';
import { ref, onValue, push } from 'firebase/database';
import { database } from './firebaseConfig';
import { 
  Box, Typography, IconButton, Chip, Avatar, Divider,
  ThemeProvider, createTheme, CssBaseline, List, ListItem,
  ListItemButton, ListItemText, ListItemAvatar, Button,
  Card, CardContent, Slider, Stack, Paper, Grid
} from '@mui/material';
import { 
  MusicNote as MusicNoteIcon,
  Smartphone as SmartphoneIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  SkipNext as SkipNextIcon,
  SkipPrevious as SkipPreviousIcon,
  VolumeUp as VolumeUpIcon,
  VolumeDown as VolumeDownIcon,
  VolumeOff as VolumeOffIcon,
  Album as AlbumIcon,
  Wifi as WifiIcon,
  Link as LinkIcon,
  LinkOff as LinkOffIcon
} from '@mui/icons-material';
import SongSearch from './components/SongSearch';
import {
  beginSpotifyLogin,
  disconnectSpotify,
  getSpotifySession,
  handleSpotifyRedirect,
} from './spotifyAuth';
import './App.css';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1DB954',
    },
    background: {
      default: '#0a0a0a',
      paper: '#121212',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  const [devices, setDevices] = useState({});
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [spotifySession, setSpotifySession] = useState(getSpotifySession());
  const [spotifyAuthError, setSpotifyAuthError] = useState('');

  useEffect(() => {
    const devicesRef = ref(database, 'devices');
    const unsubscribe = onValue(devicesRef, (snapshot) => {
      const data = snapshot.val();
      setDevices(data || {});
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let isMounted = true;

    const completeSpotifyAuth = async () => {
      try {
        const session = await handleSpotifyRedirect();
        if (!isMounted) {
          return;
        }

        setSpotifySession(session);
        setSpotifyAuthError('');
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setSpotifySession(null);
        setSpotifyAuthError(error.message);
      }
    };

    completeSpotifyAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSendCommand = async (command, deviceId = selectedDevice) => {
    if (!deviceId) {
      console.log('[Brainiak] No device selected for command:', command);
      return;
    }

    console.log('[Brainiak] Sending command:', command, 'to device:', deviceId);
    console.log('[Brainiak] Full device data:', devices[deviceId]);

    const commandsRef = ref(database, `devices/${deviceId}/commands`);
    const commandData = {
      action: command.action,
      params: command.params || {},
      timestamp: Date.now()
    };

    console.log('[Brainiak] Command data to push:', commandData);

    await push(commandsRef, commandData).then(() => {
      console.log('[Brainiak] Command pushed to Firebase successfully');
    }).catch((error) => {
      console.error('[Brainiak] Failed to push command:', error);
    });
  };

  const handleBroadcastCommand = async (command) => {
    Object.keys(devices).forEach((deviceId) => {
      handleSendCommand(command, deviceId);
    });
  };

  const deviceCount = Object.keys(devices).length;
  const selectedDeviceData = selectedDevice ? devices[selectedDevice] : null;
  const playingCount = Object.values(devices).filter(d => d.isPlaying).length;
  const onlineCount = Object.values(devices).filter(d => d.online).length;
  const isSpotifyConnected = Boolean(spotifySession?.accessToken);

  const getVolumeIcon = (volume = 50) => {
    if (volume === 0) return <VolumeOffIcon />;
    if (volume < 50) return <VolumeDownIcon />;
    return <VolumeUpIcon />;
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: '#0a0a0a' }}>
        {/* Header */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 2,
          bgcolor: 'rgba(18, 18, 18, 0.8)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid',
          borderColor: 'rgba(255,255,255,0.1)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: '#1DB954', width: 48, height: 48 }}>
              <MusicNoteIcon sx={{ fontSize: 28 }} />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={700}>
                Brainiak
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                Spotify Control Panel
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {/* Connection Status */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pr: 2, borderRight: '1px solid rgba(255,255,255,0.1)' }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" sx={{ opacity: 0.6, display: 'block', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Firebase
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center' }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#1DB954', animation: 'pulse 2s infinite' }} />
                  <Typography variant="body2" fontWeight={600} sx={{ color: '#1DB954' }}>
                    Connected
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Stats */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant={isSpotifyConnected ? 'outlined' : 'contained'}
                size="small"
                onClick={async () => {
                  if (isSpotifyConnected) {
                    disconnectSpotify();
                    setSpotifySession(null);
                    setSpotifyAuthError('');
                    return;
                  }

                  try {
                    await beginSpotifyLogin();
                  } catch (error) {
                    setSpotifyAuthError(error.message);
                  }
                }}
                startIcon={isSpotifyConnected ? <LinkOffIcon /> : <LinkIcon />}
                sx={{
                  minWidth: 160,
                  borderRadius: 2,
                  bgcolor: isSpotifyConnected ? 'transparent' : '#1DB954',
                  borderColor: isSpotifyConnected ? 'rgba(29, 185, 84, 0.4)' : 'transparent',
                  color: isSpotifyConnected ? '#1DB954' : '#08120b',
                  '&:hover': {
                    bgcolor: isSpotifyConnected ? 'rgba(29, 185, 84, 0.12)' : '#169c46',
                    borderColor: 'rgba(29, 185, 84, 0.6)',
                  }
                }}
              >
                {isSpotifyConnected ? 'Disconnect Spotify' : 'Connect Spotify'}
              </Button>

              <Box sx={{ textAlign: 'center', px: 1.5, py: 1, bgcolor: 'rgba(29, 185, 84, 0.1)', borderRadius: 2, minWidth: 70 }}>
                <Typography variant="h6" fontWeight={700} sx={{ color: '#1DB954', lineHeight: 1 }}>
                  {deviceCount}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.7, fontSize: '0.65rem', textTransform: 'uppercase' }}>
                  Total
                </Typography>
              </Box>

              <Box sx={{ textAlign: 'center', px: 1.5, py: 1, bgcolor: 'rgba(76, 175, 80, 0.1)', borderRadius: 2, minWidth: 70 }}>
                <Typography variant="h6" fontWeight={700} sx={{ color: '#4CAF50', lineHeight: 1 }}>
                  {onlineCount}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.7, fontSize: '0.65rem', textTransform: 'uppercase' }}>
                  Online
                </Typography>
              </Box>

              <Box sx={{ textAlign: 'center', px: 1.5, py: 1, bgcolor: playingCount > 0 ? 'rgba(29, 185, 84, 0.15)' : 'rgba(255,255,255,0.05)', borderRadius: 2, minWidth: 70 }}>
                <Typography variant="h6" fontWeight={700} sx={{ color: playingCount > 0 ? '#1DB954' : 'rgba(255,255,255,0.5)', lineHeight: 1 }}>
                  {playingCount}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.7, fontSize: '0.65rem', textTransform: 'uppercase' }}>
                  Playing
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Main Content */}
        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Devices Sidebar */}
          <Box sx={{
            width: 380,
            minWidth: 380,
            bgcolor: 'rgba(18, 18, 18, 0.6)',
            borderRight: '1px solid',
            borderColor: 'rgba(255,255,255,0.1)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'rgba(255,255,255,0.1)' }}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
                Devices
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.6 }}>
                Select a device to control
              </Typography>
            </Box>

            <List sx={{ flex: 1, overflow: 'auto', py: 1, px: 2 }}>
              {Object.entries(devices).map(([id, device]) => (
                <ListItem
                  key={id}
                  disablePadding
                  sx={{ mb: 1 }}
                >
                  <ListItemButton
                    selected={selectedDevice === id}
                    onClick={() => setSelectedDevice(id)}
                    sx={{
                      borderRadius: 2,
                      py: 2,
                      px: 2,
                      bgcolor: selectedDevice === id ? 'rgba(29, 185, 84, 0.15)' : 'rgba(255,255,255,0.03)',
                      border: '1px solid',
                      borderColor: selectedDevice === id ? 'rgba(29, 185, 84, 0.4)' : 'transparent',
                      '&:hover': {
                        bgcolor: selectedDevice === id ? 'rgba(29, 185, 84, 0.2)' : 'rgba(255,255,255,0.06)',
                      }
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: selectedDevice === id ? '#1DB954' : 'rgba(255,255,255,0.1)' }}>
                        <SmartphoneIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography variant="body2" fontWeight={600} sx={{ color: selectedDevice === id ? '#1DB954' : 'inherit' }}>
                            {device.name || 'Unknown Device'}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <VolumeUpIcon sx={{ fontSize: 14, opacity: 0.6 }} />
                            <Typography variant="caption" sx={{ opacity: 0.7 }}>
                              {device.volume || 50}%
                            </Typography>
                          </Box>
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            {device.online ? (
                              <Chip label="Online" size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: 'rgba(29, 185, 84, 0.15)', color: '#1DB954' }} />
                            ) : (
                              <Chip label="Offline" size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: 'rgba(255,255,255,0.08)' }} />
                            )}
                            {device.isPlaying && (
                              <Chip label="Playing" size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: 'rgba(29, 185, 84, 0.15)', color: '#1DB954' }} />
                            )}
                          </Box>
                          {device.currentTrack && (
                            <Typography variant="caption" sx={{ opacity: 0.6, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {device.currentTrack.name} — {device.currentTrack.artist}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}

              {Object.keys(devices).length === 0 && (
                <Box sx={{ textAlign: 'center', py: 8, px: 2 }}>
                  <Avatar sx={{ width: 64, height: 64, bgcolor: 'rgba(255,255,255,0.05)', margin: '0 auto 16px' }}>
                    <SmartphoneIcon sx={{ fontSize: 32, opacity: 0.5 }} />
                  </Avatar>
                  <Typography variant="body2" sx={{ opacity: 0.6 }}>
                    No devices connected
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.4, display: 'block', mt: 1 }}>
                    Install the Android app to get started
                  </Typography>
                </Box>
              )}
            </List>
          </Box>

          {/* Main Control Panel */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
            {spotifyAuthError && (
              <Card sx={{ mb: 3, bgcolor: 'rgba(255, 82, 82, 0.08)', border: '1px solid rgba(255,82,82,0.25)' }}>
                <CardContent sx={{ py: 2.5 }}>
                  <Typography variant="body2" sx={{ color: '#ff8a80' }}>
                    {spotifyAuthError}
                  </Typography>
                </CardContent>
              </Card>
            )}

            {selectedDeviceData ? (
              <Box sx={{ maxWidth: 900, mx: 'auto' }}>
                {/* Device Header */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h4" fontWeight={700} gutterBottom>
                    {selectedDeviceData.name || 'Unknown Device'}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip 
                      icon={<WifiIcon sx={{ fontSize: 14 }} />}
                      label={selectedDeviceData.online ? 'Connected' : 'Offline'}
                      size="small"
                      color={selectedDeviceData.online ? 'success' : 'default'}
                    />
                    <Chip 
                      icon={selectedDeviceData.isPlaying ? <PlayArrowIcon sx={{ fontSize: 14 }} /> : <PauseIcon sx={{ fontSize: 14 }} />}
                      label={selectedDeviceData.isPlaying ? 'Playing' : 'Paused'}
                      size="small"
                      color={selectedDeviceData.isPlaying ? 'success' : 'default'}
                    />
                  </Box>
                </Box>

                {/* Now Playing Card */}
                <Card sx={{ mb: 3, bgcolor: 'rgba(18, 18, 18, 0.8)', border: '1px solid', borderColor: 'rgba(255,255,255,0.1)' }}>
                  <CardContent sx={{ p: 3 }}>
                    {selectedDeviceData.currentTrack ? (
                      <Grid container spacing={3} alignItems="center">
                        <Grid item>
                          <Avatar 
                            sx={{ 
                              width: 100, 
                              height: 100, 
                              bgcolor: 'linear-gradient(135deg, #1DB954 0%, #169c46 100%)',
                              border: '2px solid rgba(255,255,255,0.1)'
                            }}
                          >
                            <AlbumIcon sx={{ fontSize: 48 }} />
                          </Avatar>
                        </Grid>
                        <Grid item xs>
                          <Typography variant="h4" fontWeight={700} gutterBottom>
                            {selectedDeviceData.currentTrack.name}
                          </Typography>
                          <Typography variant="h6" sx={{ opacity: 0.8, mb: 1 }}>
                            {selectedDeviceData.currentTrack.artist}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.6 }}>
                            {selectedDeviceData.currentTrack.album}
                          </Typography>
                        </Grid>
                      </Grid>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Avatar sx={{ width: 80, height: 80, bgcolor: 'rgba(255,255,255,0.05)', margin: '0 auto 16px' }}>
                          <AlbumIcon sx={{ fontSize: 40, opacity: 0.5 }} />
                        </Avatar>
                        <Typography variant="body2" sx={{ opacity: 0.6 }}>
                          No track currently playing
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>

                {/* Controls */}
                <Card sx={{ mb: 3, bgcolor: 'rgba(18, 18, 18, 0.8)', border: '1px solid', borderColor: 'rgba(255,255,255,0.1)' }}>
                  <CardContent sx={{ p: 3 }}>
                    {/* Volume */}
                    <Box sx={{ mb: 4 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getVolumeIcon(selectedDeviceData.volume)}
                          <Typography variant="body1" fontWeight={500}>
                            Volume
                          </Typography>
                        </Box>
                        <Chip 
                          label={`${selectedDeviceData.volume || 50}%`}
                          size="small"
                          sx={{ bgcolor: 'rgba(29, 185, 84, 0.15)', color: '#1DB954' }}
                        />
                      </Box>
                      <Slider
                        defaultValue={selectedDeviceData.volume || 50}
                        onChangeCommitted={(e, value) => {
                          handleSendCommand({ action: 'set_volume', params: { volume: value } });
                        }}
                        valueLabelDisplay="auto"
                        min={0}
                        max={100}
                        sx={{
                          height: 6,
                          '& .MuiSlider-track': { bgcolor: '#1DB954' },
                          '& .MuiSlider-thumb': { width: 20, height: 20 },
                          '& .MuiSlider-thumb::before': { bgcolor: '#1DB954' }
                        }}
                      />
                    </Box>

                    <Divider sx={{ my: 3, opacity: 0.1 }} />

                    {/* Playback Controls */}
                    <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
                      <Button
                        variant="outlined"
                        size="large"
                        onClick={() => handleSendCommand({ action: 'previous' })}
                        startIcon={<SkipPreviousIcon />}
                        sx={{ 
                          minWidth: 120, 
                          borderRadius: 3,
                          borderColor: 'rgba(255,255,255,0.2)',
                          '&:hover': { borderColor: '#1DB954', bgcolor: 'rgba(29, 185, 84, 0.1)' }
                        }}
                      >
                        Previous
                      </Button>

                      <Button
                        variant="contained"
                        size="large"
                        onClick={() => {
                          const action = selectedDeviceData.isPlaying ? 'pause' : 'play';
                          console.log('[Brainiak] Play/Pause button clicked, device state:', {
                            isPlaying: selectedDeviceData.isPlaying,
                            action: action,
                            device: selectedDeviceData
                          });
                          handleSendCommand({ action });
                        }}
                        startIcon={selectedDeviceData.isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                        sx={{
                          minWidth: 160,
                          borderRadius: 3,
                          bgcolor: '#1DB954',
                          fontSize: '1.1rem',
                          py: 1.5,
                          '&:hover': { bgcolor: '#169c46' }
                        }}
                      >
                        {selectedDeviceData.isPlaying ? 'Pause' : 'Play'}
                      </Button>

                      <Button
                        variant="outlined"
                        size="large"
                        onClick={() => handleSendCommand({ action: 'next' })}
                        endIcon={<SkipNextIcon />}
                        sx={{ 
                          minWidth: 120, 
                          borderRadius: 3,
                          borderColor: 'rgba(255,255,255,0.2)',
                          '&:hover': { borderColor: '#1DB954', bgcolor: 'rgba(29, 185, 84, 0.1)' }
                        }}
                      >
                        Next
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>

                {/* Song Search */}
                <SongSearch
                  isSpotifyConnected={isSpotifyConnected}
                  onConnectSpotify={beginSpotifyLogin}
                  onAddSong={(song) => handleSendCommand({
                    action: 'add_to_queue',
                    params: { uri: song.uri }
                  })}
                />
              </Box>
            ) : (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                height: '100%',
                textAlign: 'center',
                px: 3
              }}>
                <Avatar sx={{ width: 120, height: 120, bgcolor: 'rgba(29, 185, 84, 0.1)', mb: 3 }}>
                  <SmartphoneIcon sx={{ fontSize: 60, color: '#1DB954' }} />
                </Avatar>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                  Welcome to Brainiak
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.6, mb: 4 }}>
                  Select a device from the sidebar to control its Spotify playback
                </Typography>

                {Object.keys(devices).length > 0 && (
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => handleBroadcastCommand({ action: 'play' })}
                      startIcon={<PlayArrowIcon />}
                      sx={{ minWidth: 150, borderRadius: 3, bgcolor: '#1DB954', '&:hover': { bgcolor: '#169c46' } }}
                    >
                      Play All
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => handleBroadcastCommand({ action: 'pause' })}
                      startIcon={<PauseIcon />}
                      sx={{ minWidth: 150, borderRadius: 3, borderColor: 'rgba(255,255,255,0.2)' }}
                    >
                      Pause All
                    </Button>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
