# Tyyliohje fronttiin

## Funktio definition

Ei käytetä JS:n function-avainsanaa, vaan lambdafunktio-tyylisesti.

Eli tehdään tälläin

```
const funktio = (attribuutit) => {
    1 + 1;
    return 2;
}
```

Niitä **EI** tehdä tälläin

```
function funktio() = {
    1 + 1;
    return 2;
}
```

Tätä näkee aika harvoin mut silti grrr

## style vs className

Vältetään JS-koodin sisällä kirjoittamassa css-tyylejä, vaan mielummin tehdään ne omissa scss-tiedostoissa. Tämä ei kuitenkaan ole hard-sääntö, jos joku toimii paremmin stylellä niin tehdään sillain.

Eli tehdään tälläin:

```
<input className="searchBar" />
```

Niitä **EI** tehdä tälläin

```
<input id="searchBar" style={{ fontSize: "14px", lineHeight: 1.5, color: "#333" }} />
```

## tab pituus

Tabin pituus on neljä (4) välilyöntiä. Vaikka oma kone tekee vain 2 tai Copilot kirjoittaa 2, niin käytetään 4.

Eli tehdään tälläin:

```
if (editMode) {
    addMarker()
} else {
    setPosition({
        x: cursor.x,
        y: cursor.y
    })
}
```

Niitä **EI** tehdä tälläin

```
if (editMode) {
  addMarker()
} else {
  setPosition({
    x: cursor.x,
    y: cursor.y
  })
}
```

## tabit järkevästi

Asiat tabitetään ja ne tabitetaan siten, että aukeava sulku/div on samalla etäisyydellä kuin sulkeutuva sulku/div. Aina ei ole yhtä oikeaa tapaa tabittää asiat järjevästi, mutta hyvä pitää mielessä että täbien idea on selkeyttää, mitkä osat ovat minkä sulkeiden/divien alaisia.

Eli tehdään tälläin:

```
{popupPosition && (
    <div>
        <p>Tärkeä nappi</p>
        <button
            className="popupButton"
            onClick={() => {
                marker.setPosition({
                    x: popupPosition.x,
                    y: popupPosition.y
                });
            }}
        >
            Start Marker
        </button>
    </div>
)}
```

Niitä **EI** tehdä tälläin

```
{popupPosition && (
    <div>
    <p>Tärkeä nappi</p>
        <button
        className="popupButton"
            onClick={() => {
              marker.setPosition({
              x: popupPosition.x,
              y: popupPosition.y
            });
            }
            }>
                Start Marker
            </button>
    </div>
    )}
```

Joissain paikoissa nää on lähteny vähä menee miten sattuu, joten ne ois kiva korjaa.

# Arkkitehtuuriohje

## React Context + dispatch

Reactin sisäistä useContext ja useReducer/dispatch() on hyvä käyttää asioissa, jotka muokkaa suoraan mitä divejä on näkyvissä tai missä modessa mennään. Jos asia muuttaa vain esim. divin sisäistä tekstiä, se voi olla parempi olla Redux storessa.

Koko ohjelman contexti on näkyvissä kaikkialla (App.js korkein taso).

Eli tehdään tälläin:

```
{ state, dispatch } = useContext(AppContext)

<button
    onClick={() => {
        dispatch({
            type: 'SET_MODAL_VISIBILITY',
            payload: state.modalVisibility
        })
    }}
>
    x
</button>
```

Niitä **EI** tehdä tälläin

```
<button
    onClick={() => {
        dispatch({
            type: 'DISCONNECTED_ROADS_LIST',
            payload: disconnectedRoads
        })
    }}
>
    x
</button>
```

## Redux Store + useDispatch()

Redux store on tehty logiikka-täydemmille jutuille, ja sen reducerit löytyvät `features` kansiosta.
