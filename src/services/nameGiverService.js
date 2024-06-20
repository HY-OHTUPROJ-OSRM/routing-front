function capFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function generateName() {
    var adjectives = ['Tukkoinen', 'Tukossa', 'Tukittu', 'Estynyt', 'Pysähtynyt', 'Suljettu', 'Tukahdutettu', 'Tukossa oleva', 'Pysäköity', 'Esteenä oleva', 'Suljettu', 'Katkennut', 'Umpeenkasvanut', 'Tulviva', 'Ruuhkautunut', 'Sulkeutunut', 'Pysäköintikielto', 'Liikennekatko', 'Eristetty', 'Liikennerajoitus', 'Tukossa oleva', 'Ohituskelvoton', 'Tukko', 'Tulvainen', 'Kaatunut', 'Umpeenkasvanut', 'Kiertotie', 'Rakenteilla', 'Työmaa', 'Lumivyöry'];

    var substantives = ['tie', 'reitti', 'katu', 'väylä', 'polku', 'ajoväylä', 'pääväylä', 'sivukatu', 'kulku', 'kiertotie', 'liikenneväylä', 'katualue', 'ajorata', 'liikennereitti', 'kulkuaukko', 'liikenneyhteys', 'viestintäreitti', 'liikennepaikka', 'kulkuväylä', 'liikenneväylä', 'kulkuaukko', 'kulkualue', 'kulkureitti', 'liikennevyöhyke', 'katuosoite', 'kulkureitti', 'liikennepaikka', 'katualue', 'kulkualue', 'liikennealue'];

    var name1 = adjectives;
    var name2 = substantives;

    var name = capFirst(name1[getRandomInt(0, name1.length)]) + ' ' + capFirst(name2[getRandomInt(0, name2.length)]);
    return name;
}
export { generateName };