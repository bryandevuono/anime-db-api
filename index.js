const animeData = require('./db/anime-offline-database-minified.json');
const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 10000;

app.use(cors());

app.get('/v1/details', (req, res) => {
    const animeTitle = req.query.title;
    let val = animeTitle.trim(); 
    let RegEx = /^[a-z0-9]+$/i; 
    let Valid = RegEx.test(val);
    if (animeTitle.length < 60 && animeTitle.length > 0 && Valid) {
        // pass
    } else {
        return res.status(400).json({ error: 'animeName query parameter is required' });
    }

    const anime = animeData.data.find(a => a.title.toLowerCase() === animeTitle.toLowerCase());
    return res.status(200).json({
        result: anime
    })
});

app.get('/v1/upcoming', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const upcomingAnime = animeData.data.filter(a => a.status === 'UPCOMING');
    const total = upcomingAnime.length;
    res.json({
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        data: upcomingAnime.slice((page - 1) * limit, page * limit)
    });
});

app.get('/v1/search', (req, res) => {
    // e.g. dramatic
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const keyword = req.query.keyword;
    if (!keyword || keyword.length < 3) {
        return res.status(400).json({ error: 'keyword query parameter is required and must be at least 3 characters long' });
    }

    let searchResults = [];
    for (let i = 0; i < animeData.data.length; i++) {
        if (animeData.data[i].tags.includes(keyword)) {
            searchResults.push(animeData.data[i]);
        }
    }

    if (searchResults.length === 0) {
        return res.status(404).json({ error: 'No results found' });
    }
    res.json({
        page,
        limit,
        total: searchResults.length,
        data: searchResults.slice((page - 1) * limit, page * limit)
    });
});

//top rated of all time
app.get('/v1/top', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (page < 1 || limit < 1) {
        return res.status(400).json({ error: 'page and limit must be greater than 0' });
    }
    if (page > 1000 || limit > 100) {
        return res.status(400).json({ error: 'page must be less than 1000 and limit must be less than 100' });
    }

    let result = [];
    for (let i = 0; i < animeData.data.length; i++) {
        const score = animeData.data[i].score;
        if (score && typeof score === 'object' && score.median !== undefined) {
            if (score.median > 8) {
                result.push(animeData.data[i]);
            }
        }
    }

    res.json({
        page,
        limit,
        total: result.length,
        data: result.slice((page - 1) * limit, page * limit)
    })
});

//season search
app.get('/v1/search/season', (req, res) => {
    const seasonInput = req.query.season;
    if (!seasonInput || seasonInput.length < 3) {
        return res.status(400).json({ error: 'season query parameter is required and must be at least 3 characters long' });
    }
    const year = parseInt(req.query.year, 10);
    if (!year || isNaN(year) || req.query.year.length !== 4) {
        return res.status(400).json({ error: 'year query parameter is required and must be a valid 4-digit year' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (page < 1 || limit < 1) {
        return res.status(400).json({ error: 'page and limit must be greater than 0' });
    }
    if (page > 1000 || limit > 100) {
        return res.status(400).json({ error: 'page must be less than 1000 and limit must be less than 100' });
    }

    let result = [];
    for (let i = 0; i < animeData.data.length; i++) {
        const season = animeData.data[i].animeSeason;
        if (season && season.season.toLowerCase() === seasonInput.toLowerCase() && season.year === parseInt(year, 10)) {
            result.push(animeData.data[i]);
        }
    }

    if (result.length === 0) {
        console.log(result);
        return res.status(404).json({ error: 'No results found' });
    }

    res.json({
        page,
        limit,
        total: result.length,
        data: result.slice((page - 1) * limit, page * limit)
    })
});

app.listen(port, () => {
    console.log(`API running on port ${port}`);
});