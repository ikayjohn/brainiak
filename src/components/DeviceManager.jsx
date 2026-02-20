import { 
  Box, Card, CardContent, List, ListItem, ListItemButton, 
  ListItemText, Typography, Chip, Avatar, IconButton, 
  Divider, Tooltip 
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import TabletIcon from '@mui/icons-material/Tablet';
import DevicesIcon from '@mui/icons-material/Devices';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

function DeviceManager({ devices, selectedDevice, onSelectDevice, onSendCommand }) {
  const getDeviceIcon = (name) => {
    const n = name?.toLowerCase() || '';
    if (n.includes('tablet') || n.includes('ipad')) return <TabletIcon />;
    if (n.includes('phone') || n.includes('galaxy') || n.includes('pixel')) return <SmartphoneIcon />;
    return <DevicesIcon />;
  };

  const getDeviceId = (id) => id.slice(0, 8);

  return (
    <Card className="device-manager-card">
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DevicesIcon color="primary" />
            <Typography variant="h6" fontWeight={600}>
              Devices
            </Typography>
            <Chip 
              label={Object.keys(devices).length} 
              size="small" 
              color="primary"
              sx={{ ml: 1 }}
            />
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <List disablePadding>
          {Object.entries(devices).map(([id, device], index) => (
            <div key={id}>
              <ListItem
                disablePadding
                secondaryAction={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mr: 1 }}>
                      <VolumeUpIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        {device.volume || 50}%
                      </Typography>
                    </Box>
                    <Tooltip title={device.isPlaying ? 'Pause' : 'Play'}>
                      <IconButton
                        size="small"
                        onClick={() => onSendCommand({ action: device.isPlaying ? 'pause' : 'play' })}
                        color={device.isPlaying ? 'success' : 'default'}
                      >
                        {device.isPlaying ? <PlayArrowIcon /> : <PauseIcon />}
                      </IconButton>
                    </Tooltip>
                  </Box>
                }
              >
                <ListItemButton
                  selected={selectedDevice === id}
                  onClick={() => onSelectDevice(id)}
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      }
                    }
                  }}
                >
                  <Avatar sx={{ mr: 2, bgcolor: selectedDevice === id ? 'white' : 'primary.main' }}>
                    {getDeviceIcon(device.name)}
                  </Avatar>
                  <ListItemText
                    primary={
                      <Typography 
                        variant="body2" 
                        fontWeight={600}
                        color={selectedDevice === id ? 'white' : 'text.primary'}
                      >
                        {device.name || `Device ${getDeviceId(id)}`}
                      </Typography>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        {device.isPlaying ? (
                          <Chip 
                            label="Playing" 
                            color="success" 
                            size="small"
                            sx={{ height: 20, fontSize: '0.65rem' }}
                          />
                        ) : (
                          <Chip 
                            label="Idle" 
                            size="small"
                            sx={{ height: 20, fontSize: '0.65rem' }}
                          />
                        )}
                        {device.currentTrack && (
                          <Typography 
                            variant="caption" 
                            color={selectedDevice === id ? 'rgba(255,255,255,0.7)' : 'text.secondary'}
                            sx={{ 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis', 
                              whiteSpace: 'nowrap',
                              maxWidth: 150
                            }}
                          >
                            {device.currentTrack.name}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItemButton>
              </ListItem>
              {index < Object.keys(devices).length - 1 && <Divider />}
            </div>
          ))}
        </List>

        {Object.keys(devices).length === 0 && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Avatar 
              sx={{ 
                width: 64, 
                height: 64, 
                bgcolor: 'action.hover',
                margin: '0 auto 16px'
              }}
            >
              <DevicesIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              No devices connected
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Install the Android app on your devices to get started
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default DeviceManager;
