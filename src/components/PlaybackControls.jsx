import { 
  Box, Card, CardContent, Button, Typography, Slider, 
  Avatar, Chip, Stack, Paper, Grid
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeDownIcon from '@mui/icons-material/VolumeDown';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import AlbumIcon from '@mui/icons-material/Album';

function PlaybackControls({ device, onSendCommand }) {
  if (!device) return null;

  const getVolumeIcon = (volume) => {
    if (volume === 0) return <VolumeOffIcon />;
    if (volume < 50) return <VolumeDownIcon />;
    return <VolumeUpIcon />;
  };

  return (
    <Card className="playback-card">
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PlayArrowIcon color="primary" />
            <Typography variant="h6" fontWeight={600}>
              Now Playing
            </Typography>
          </Box>
          <Chip 
            icon={device.isPlaying ? <PlayArrowIcon /> : <PauseIcon />}
            label={device.isPlaying ? 'Playing' : 'Paused'}
            color={device.isPlaying ? 'success' : 'default'}
            size="small"
          />
        </Box>

        {device.currentTrack ? (
          <Paper 
            elevation={0}
            sx={{ 
              bgcolor: 'primary.main',
              color: 'white',
              borderRadius: 3,
              p: 3,
              mb: 3,
              background: 'linear-gradient(135deg, #1DB954 0%, #169c46 100%)'
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <Avatar 
                  sx={{ 
                    width: 80, 
                    height: 80, 
                    bgcolor: 'rgba(255,255,255,0.2)',
                    border: '2px solid rgba(255,255,255,0.3)'
                  }}
                >
                  <AlbumIcon sx={{ fontSize: 40 }} />
                </Avatar>
              </Grid>
              <Grid item xs>
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  {device.currentTrack.name}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  {device.currentTrack.artist}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                  {device.currentTrack.album}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        ) : (
          <Box 
            sx={{ 
              bgcolor: 'action.hover',
              borderRadius: 3,
              p: 4,
              mb: 3,
              textAlign: 'center'
            }}
          >
            <Avatar 
              sx={{ 
                width: 64, 
                height: 64, 
                bgcolor: 'action.disabledBackground',
                margin: '0 auto 16px'
              }}
            >
              <AlbumIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Typography variant="body2" color="text.secondary">
              No track currently playing
            </Typography>
          </Box>
        )}

        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getVolumeIcon(device.volume || 50)}
              <Typography variant="body2" fontWeight={500}>
                Volume
              </Typography>
            </Box>
            <Chip 
              label={`${device.volume || 50}%`}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Box>
          <Slider
            defaultValue={device.volume || 50}
            onChangeCommitted={(e, value) => onSendCommand({ action: 'set_volume', params: { volume: value } })}
            valueLabelDisplay="auto"
            min={0}
            max={100}
            sx={{
              '& .MuiSlider-thumb': {
                width: 20,
                height: 20,
              }
            }}
          />
        </Box>

        <Stack direction="row" spacing={2} justifyContent="center">
          <Button
            variant="outlined"
            size="large"
            onClick={() => onSendCommand({ action: 'previous' })}
            sx={{ minWidth: 120, borderRadius: 3 }}
          >
            <SkipPreviousIcon sx={{ mr: 1 }} />
            Previous
          </Button>
          
          <Button
            variant="contained"
            size="large"
            color={device.isPlaying ? 'warning' : 'success'}
            onClick={() => onSendCommand({ action: device.isPlaying ? 'pause' : 'play' })}
            sx={{ 
              minWidth: 140, 
              borderRadius: 3,
              bgcolor: device.isPlaying ? 'warning.main' : '#1DB954',
              '&:hover': {
                bgcolor: device.isPlaying ? 'warning.dark' : '#169c46',
              }
            }}
          >
            {device.isPlaying ? <PauseIcon sx={{ mr: 1 }} /> : <PlayArrowIcon sx={{ mr: 1 }} />}
            {device.isPlaying ? 'Pause' : 'Play'}
          </Button>
          
          <Button
            variant="outlined"
            size="large"
            onClick={() => onSendCommand({ action: 'next' })}
            sx={{ minWidth: 120, borderRadius: 3 }}
          >
            Next
            <SkipNextIcon sx={{ ml: 1 }} />
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default PlaybackControls;
