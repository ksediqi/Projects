const express = require('express');
const router = express.Router();
const axios = require('axios');
// require('dotenv').config();
// API_KEY = "5b4eef4dfacf031eff5d74a5fd12f2ae"
const apikey = process.env.API_KEY;


router.get('/api/all-content', async (req, res) => {
    try {
        const [movies, tv, kidsMovies, kidsTv] = await Promise.all([
            axios.get(`https://api.themoviedb.org/3/movie/popular?api_key=${apikey}&language=en-US&page=1`),
            axios.get(`https://api.themoviedb.org/3/tv/popular?api_key=${apikey}&language=en-US&page=1`),
            axios.get(`https://api.themoviedb.org/3/movie/popular?api_key=${apikey}&language=en-US&page=1&with_genres=28`),
            axios.get(`https://api.themoviedb.org/3/tv/popular?api_key=${apikey}&language=en-US&page=1&with_genres=10751`)
        ])
        res.json({
            movies: movies.data.results,
            tv: tv.data.results,
            kidsMovies: kidsMovies.data.results,
        });


    } catch (err) {
        res.status(500).json({message: "Something went wrong. Please try again later."})
        console.log(err);
    }

})


module.exports = router;

