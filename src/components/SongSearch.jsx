import { useState } from 'react';
import { 
  Box, Card, CardContent, TextField, Button, List, ListItem, 
  ListItemText, Typography, CircularProgress, Avatar, Chip,
  Stack, IconButton, InputAdornment, ListItemAvatar
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import AlbumIcon from '@mui/icons-material/Album';
import ClearIcon from '@mui/icons-material/Clear';
import { getValidSpotifyAccessToken } from '../spotifyAuth';

function SongSearch({ isSpotifyConnected, onConnectSpotify, onAddSong }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchSpotify = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    try {
      const accessToken = await getValidSpotifyAccessToken();
      if (!accessToken) {
        setError('Spotify session expired. Connect again to continue.');
        setResults([]);
        return;
      }

      const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || 'Spotify search failed');
      }

      const data = await response.json();
      setResults(data.tracks.items || []);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
      setError(error.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = (track) => {
    onAddSong({ uri: track.uri });
    setResults(prev => prev.filter(t => t.id !== track.id));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchSpotify();
    }
  };

  return (
    <Card sx={{ bgcolor: 'rgba(18, 18, 18, 0.8)', border: '1px solid', borderColor: 'rgba(255,255,255,0.1)' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <QueueMusicIcon sx={{ fontSize: 28, color: '#1DB954' }} />
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Add to Queue
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.6 }}>
              Search for songs to add to the playback queue
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search for songs, artists, or albums..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ opacity: 0.5 }} />
                </InputAdornment>
              ),
              endAdornment: query && (
                <InputAdornment position="end">
                  <IconButton 
                    size="small" 
                    onClick={() => setQuery('')}
                    edge="end"
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'rgba(255,255,255,0.05)',
                borderRadius: 2,
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.08)',
                },
              },
              '& .MuiOutlinedInput-input': {
                py: 1.5,
              }
            }}
          />
          <Button
            variant="contained"
            onClick={searchSpotify}
            disabled={loading || !query.trim()}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SearchIcon />}
            sx={{ 
              bgcolor: '#1DB954',
              borderRadius: 2,
              px: 3,
              minWidth: 100,
              '&:hover': { bgcolor: '#169c46' },
              '&:disabled': { bgcolor: 'rgba(255,255,255,0.1)' }
            }}
          >
            {loading ? 'Searching' : 'Search'}
          </Button>
        </Box>

        {!isSpotifyConnected ? (
          <Box 
            sx={{ 
              bgcolor: 'rgba(255, 193, 7, 0.1)',
              border: '1px solid rgba(255, 193, 7, 0.3)',
              borderRadius: 3,
              p: 4,
              textAlign: 'center'
            }}
          >
            <QueueMusicIcon sx={{ fontSize: 48, mb: 2, color: '#FFC107' }} />
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: '#FFC107' }}>
              Spotify Connection Required
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, mb: 3 }}>
              Connect your Spotify account to search and queue songs
            </Typography>
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={onConnectSpotify}
              sx={{ 
                borderRadius: 2,
                bgcolor: '#FFC107',
                color: '#000',
                '&:hover': { bgcolor: '#FFB300' }
              }}
            >
              Connect Spotify
            </Button>
          </Box>
        ) : (
          <>
            {error && (
              <Box sx={{ mb: 2, p: 2, borderRadius: 2, bgcolor: 'rgba(255,82,82,0.08)', border: '1px solid rgba(255,82,82,0.22)' }}>
                <Typography variant="body2" sx={{ color: '#ff8a80' }}>
                  {error}
                </Typography>
              </Box>
            )}

            {loading ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
                <CircularProgress size={48} sx={{ mb: 2, color: '#1DB954' }} />
                <Typography variant="body2" sx={{ opacity: 0.6 }}>
                  Searching Spotify...
                </Typography>
              </Box>
            ) : results.length > 0 ? (
              <List sx={{ py: 1 }}>
                {results.map((track) => (
                  <ListItem
                    key={track.id}
                    sx={{
                      mb: 1,
                      p: 2,
                      borderRadius: 2,
                      bgcolor: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' }
                    }}
                    secondaryAction={
                      <IconButton 
                        onClick={() => handleAdd(track)}
                        sx={{ 
                          bgcolor: 'rgba(29, 185, 84, 0.15)',
                          color: '#1DB954',
                          '&:hover': { bgcolor: 'rgba(29, 185, 84, 0.25)' }
                        }}
                      >
                        <AddIcon />
                      </IconButton>
                    }
                  >
                    <ListItemAvatar>
                      <Avatar 
                        src={track.album.images[0]?.url}
                        sx={{ width: 56, height: 56, bgcolor: 'rgba(29, 185, 84, 0.15)' }}
                      >
                        <AlbumIcon sx={{ color: '#1DB954' }} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body1" fontWeight={600}>
                          {track.name}
                        </Typography>
                      }
                      secondary={
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                          <Typography variant="caption" sx={{ opacity: 0.7 }}>
                            {track.artists.map(a => a.name).join(', ')}
                          </Typography>
                          <Chip 
                            label={track.album.name}
                            size="small"
                            sx={{ height: 20, fontSize: '0.65rem', bgcolor: 'rgba(255,255,255,0.08)' }}
                          />
                        </Stack>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : query ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Avatar sx={{ width: 64, height: 64, bgcolor: 'rgba(255,255,255,0.05)', margin: '0 auto 16px' }}>
                  <SearchIcon sx={{ fontSize: 32, opacity: 0.5 }} />
                </Avatar>
                <Typography variant="body2" sx={{ opacity: 0.6 }}>
                  No results found for "{query}"
                </Typography>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Avatar sx={{ width: 64, height: 64, bgcolor: 'rgba(29, 185, 84, 0.1)', margin: '0 auto 16px' }}>
                  <QueueMusicIcon sx={{ fontSize: 32, color: '#1DB954' }} />
                </Avatar>
                <Typography variant="body2" sx={{ opacity: 0.6 }}>
                  Ready to search
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.4, display: 'block', mt: 1 }}>
                  Enter a song name or artist above
                </Typography>
              </Box>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default SongSearch;
