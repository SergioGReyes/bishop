const { Router } = require('express');
const axios = require('axios');
const parser = require('xml2json');
let apiArray = [];

module.exports = new Router()

  .get('/', (req, res) => {
    axios.get('http://www.clashapi.xyz/api/cards/')
      .then(cards => {
        let cardObject = {};
        for (var i = 0; i < cards.data.length; i++) {
          cardObject = {
            id: cards.data[i]._id,
            name: cards.data[i].name
          }
          apiArray.push(cardObject);
        }
        return axios.get('https://pokeapi.co/api/v2/pokemon/')
          .then(pokemon => {
            let pokemonObject = {};
            for (var i = 0; i < pokemon.data.results.length; i++) {
              pokemonObject = {
                id: i + 1,
                name: pokemon.data.results[i].name
              }
              apiArray.push(pokemonObject);
            }
            return axios.get('http://ergast.com/api/f1/drivers?limit=1000')
              .then(driver => {
                let driverObject = {};
                const xml = driver.data
                const json = parser.toJson(xml, options = {
                  object: true,
                  reversible: false,
                  coerce: false,
                  sanitize: true,
                  trim: true,
                  arrayNotation: false,
                  alternateTextNode: false
                });
                for (var i = 0; i < json.MRData.DriverTable.Driver.length; i++) {
                  driverObject = {
                    id: json.MRData.DriverTable.Driver[i].driverId,
                    name: json.MRData.DriverTable.Driver[i].GivenName + ' '
                      + json.MRData.DriverTable.Driver[i].FamilyName
                  }
                  apiArray.push(driverObject);
                }
                res.json(200, { apiArray });
              })
          })
      })
      .catch(error => {
        console.log(error)
      });
  })

  .get('/:id', (req, res) => {
    let id = req.params.id;
    let idObject = {};
    axios.get(`http://www.clashapi.xyz/api/cards/${id}`)
      .then(cards => {
        idObject = {
          id: cards.data._id,
          image: 'none',
          name: cards.data.name
        }
        res.json(200, { idObject });
      })
      .catch(() => {
        return axios.get(`https://pokeapi.co/api/v2/pokemon-form/${id}`)
          .then(pokemon => {
            idObject = {
              id: pokemon.data.id,
              image: pokemon.data.sprites.front_default,
              name: pokemon.data.name
            }
            res.json(200, { idObject });
          })
          .catch(() => {
            return axios.get(`http://ergast.com/api/f1/drivers/${id}`)
              .then(driver => {
                const xml = driver.data
                const json = parser.toJson(xml, options = {
                  object: true,
                  reversible: false,
                  coerce: false,
                  sanitize: true,
                  trim: true,
                  arrayNotation: false,
                  alternateTextNode: false
                });
                if (json.MRData.DriverTable.Driver) {
                  idObject = {
                    id: json.MRData.DriverTable.Driver.driverId,
                    image: json.MRData.DriverTable.Driver.url,
                    name: json.MRData.DriverTable.Driver.GivenName + ' '
                      + json.MRData.DriverTable.Driver.FamilyName
                  }
                  res.json(200, { idObject });
                } else {
                  res.status(500).send('Id not found!');
                }
              })
              .catch(error => {
                console.log(error, 'Not found')
              });
          })
      });
  });
