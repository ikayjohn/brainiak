import { useState } from 'react';
import { 
  Box, Card, CardContent, TextField, Button, List, ListItem, 
  ListItemText, Typography, CircularProgress, Avatar, Chip,
  Stack, Paper, IconButton, InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import AlbumIcon from '@mui/icons-material/Album';
import ClearIcon from '@mui/icons-material/Clear';

function SongSearch({ onAddSong }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchSpotify = async () => {
    if (!query) return;

    setLoading(true);
    try {
      const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('spotify_token')}`
        }
      });
      const data = await response.json();
      setResults(data.tracks.items || []);
    } catch (error) {
      console.error('Search failed:', error);
    }
    setLoading(false);
  };

  const handleAdd = (track) => {
    onAddSong({ uri: track.uri });
    setResults(prev => prev.filter(t => t.id !== track.id));
  };

  return (
    <Card className="search-card">
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <QueueMusicIcon color="primary" />
          <Typography variant="h6" fontWeight={600}>
            Search & Queue
          </Typography>
        </Box>

        <TextField
          fullWidth
          placeholder="Search for songs, artists, albums..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && searchSpotify()}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
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
            mb: 2,
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
            }
          }}
        />

        {!localStorage.getItem('spotify_token') ? (
          <Paper 
            elevation={0}
            sx={{ 
              bgcolor: 'warning.main',
              color: 'warning.contrastText',
              borderRadius: 3,
              p: 3,
              textAlign: 'center'
            }}
          >
            <QueueMusicIcon sx={{ fontSize: 48, mb: 1, opacity: 0.9 }} />
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Spotify Connection Required
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
              Connect your Spotify account to search and queue songs
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SearchIcon />}
              onClick={() => window.location.href = '/auth/spotify'}
              sx={{ borderRadius: 2 }}
            >
              Connect Spotify
            </Button>
          </Paper>
        ) : (
          <>
            {loading ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6 }}>
                <CircularProgress size={48} sx={{ mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  Searching Spotify...
                </Typography>
              </Box>
            ) : results.length > 0 ? (
              <List disablePadding>
                {results.map((track) => (
                  <ListItem
                    key={track.id}
                    disablePadding
                    sx={{ 
                      mb: 1,
                      borderRadius: 2,
                      bgcolor: 'action.hover',
                      '&:hover': {
                        bgcolor: 'action.selected',
                      }
                    }}
                  >
                    <Avatar 
                      src={track.album.images[0]?.url}
                      sx={{ mr: 2, width: 56, height: 56 }}
                    >
                      <AlbumIcon />
                    </Avatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" fontWeight={600}>
                          {track.name}
                        </Typography>
                      }
                      secondary={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="caption" color="text.secondary">
                            {track.artists.map(a => a.name).join(', ')}
                          </Typography>
                          <Chip 
                            label={track.album.name}
                            size="small"
                            sx={{ height: 20, fontSize: '0.65rem' }}
                          />
                        </Stack>
                      }
                    />
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => handleAdd(track)}
                      sx={{ borderRadius: 2, minWidth: 100 }}
                    >
                      Add
                    </Button>
                  </ListItem>
                ))}
              </List>
            ) : query ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Avatar 
                  sx={{ 
                    width: 64, 
                    height: 64, 
                    bgcolor: 'action.hover',
                    margin: '0 auto 16px'
                  }}
                >
                  <SearchIcon sx={{ fontSize: 32 }} />
                </Avatar>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  No results found
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Try different keywords
                </Typography>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Avatar 
                  sx={{ 
                    width: 64, 
                    height: 64, 
                    bgcolor: 'action.hover',
                    margin: '0 auto 16px'
                  }}
                >
                  <QueueMusicIcon sx={{ fontSize: 32 }} />
                </Avatar>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  Ready to search
                </Typography>
                <Typography variant="caption" color="text.secondary">
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
