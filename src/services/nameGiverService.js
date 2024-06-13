function capFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function generateName() {
    var adjectives = ['Tukkoinen', 'Tukossa', 'Tukittu', 'Estynyt', 'Pysähtynyt', 'Suljettu', 'Tukahdutettu', 'Tukossa oleva', 'Pysäköity', 'Esteenä oleva', 'Suljettu', 'Katkennut', 'Umpeenkasvanut', 'Tulviva', 'Ruuhkautunut', 'Sulkeutunut', 'Pysäköintikielto', 'Liikennekatko', 'Eristetty', 'Liikennerajoitus', 'Tukossa oleva', 'Ohituskelvoton', 'Tukko', 'Tulvainen', 'Kaatunut', 'Umpeenkasvanut', 'Kiertotie', 'Rakenteilla', 'Työmaa', 'Lumivyöry'];

    var substantives = ['Tie', 'Reitti', 'Katu', 'Väylä', 'Polku', 'Ajoväylä', 'Pääväylä', 'Sivukatu', 'Kulku', 'Kiertotie', 'Liikenneväylä', 'Katualue', 'Ajorata', 'Liikennereitti', 'Kulkuaukko', 'Liikenneyhteys', 'Viestintäreitti', 'Liikennepaikka', 'Kulkuväylä', 'Liikenneväylä', 'Kulkuaukko', 'Kulkualue', 'Kulkureitti', 'Liikennevyöhyke', 'Katuosoite', 'Kulkureitti', 'Liikennepaikka', 'Katualue', 'Kulkualue', 'Liikennealue'];

    var name1 = adjectives;
    var name2 = substantives;

    var name = capFirst(name1[getRandomInt(0, name1.length)]) + ' ' + capFirst(name2[getRandomInt(0, name2.length)]);
    return name;
}
export { generateName };