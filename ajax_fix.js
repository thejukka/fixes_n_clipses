/**
* Jokaikisen Ajax -pyynnön suorituksessa, virheen sattuessa näytetään siitä
* ilmoitus, sensijaan ettei näytettäisi mitään ja pyritään olla hämmentämättä
* käyttäjää. Ja jos jostain syystä käyttäjällä ei ole oikeuksia vastaavaan
* pyyntöön (esim. session timeout, tms.), niin logataan ulos.
*/
$(document).ajaxError(function(event, jqxhr, settings, thrownError) {
	if (jqxhr.status == 500) {
		alert(gettext("Palvelimella tapahtui virhe."));
		return;
	}
	if (typeof jqxhr.responseText === 'string' && jqxhr.responseText !== '')
		window.alert(jqxhr.responseText);
	if (jqxhr.status == 403)
		logout();
});
