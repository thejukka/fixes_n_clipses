/**
* IP- ja domain -osoitteiden tarkistus, ennenkuin viedään PHP:lle
* hyväksyttäväksi (haetaan kannasta millä IP:llä/domainilla pääsee ja ei pääse
* kirjautumaan sisään). Lähinnä paikallisverkon laitteille. Seuraavat muodot
* ovat sallittuja:
*
* 192.168.
* 192.168.0.0
* 192.168.0.10-25
* 192.168.*
* 192.168.*.*
* domain.*
* alidomain.domain.*
*
* ..jne. Voidaan antaa useita domaineja ja IP-osoitteita ja verkko-osoitteita
* pilkulla erottamalla, esim: 192.168.*, 10.0.2.*, domain.*
* ja enimmillään 29 -pilkulla erotettua arvoa. Jos kenttä jätetään tyhjäksi,
* kirjautumaan pääsee mistä vain, muuten noudatetaan arvosääntöjä ja ainoastaan
* annetuista pääsee kirjautumaan.
*/
var IPAddress = {
	err: false,

	errMsg: {
		"pre"		: gettext("Virheellinen IP-asetus: "),
		"oletus"	: "\n"+gettext("IP-osoitemääritykset tulee antaa kokonaisuudessaan \\
                                                IPv4-standardin mukaisesti (esim. 192.168.*.*)"),
		"val"		: "\n"+gettext("Arvojen tulee olla välillä 0-255"),
		"std"		: "\n"+gettext("Asetus ei ole IPv4-standardin mukainen"),
		"path"		: "\n"+gettext("Polkumääritykset eivät ole sallittuja"),
		"empty"		: "\n"+gettext("Tyhjä arvo"),
		"chr"		: "\n"+gettext("Arvo sisältää kiellettyjä merkkejä"),
		"max"		: "\n"+gettext("IP-asetuksia voidaan antaa enintään 29"),
		"len"		: "\n"+gettext("Liian pitkä asetusarvo (kirjainmäärä 500)"),
		"location"	: "\n"+gettext("Lokaatiotiedot eivät ole sallittuja (@)")
	},

	stringLength: 500,
	nrOfIps: 29,
	ipCellLength: 4,
	elm: false,
	gotit: false,

	indicate: function() {
		if (this.err)
			this.elm.css({ 'background-color': '#F00', 'color': '#FFF' });
		else
			this.elm.css({ 'background-color': '#FFF', 'color': '#000' });
	},

	validate: function(addr) {
		var ip = addr.split(".");
		var isDomain = addr;
		var err = this.errMsg;
		isDomain = isDomain.replace(/\./g, '');
		isDomain = isDomain.replace(/\*/g, '');
		isDomain = isDomain.replace(/\-/g, '');

		if (isNaN(isDomain)) {
			var chr = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-";
			if (ip.length < 2 || ip.length > 4)
				this.err = err.pre + addr;
			else {
				for (var i in ip) {
					if (ip[i].slice(-1) === "-" || ip[i][0] === "-") {
						this.err = err.pre + addr;
						break;
					} else if (ip[i].indexOf('@') != -1) {
						this.err = err.pre + addr + err.location;
						break;
					} else if (ip[i].indexOf('/') != -1) {
						this.err = err.pre + addr + err.path;
						break;
					} else {
						for (var ii in ip[i]) {
							if (chr.indexOf(ip[i][ii]) === -1) {
								this.err = err.pre + addr;
								break;
							}
						}
					}
				}
			}
		} else if (ip.length === this.ipCellLength) {
			for (var i in ip) {
				if (this.err)
					continue;
				if (i < 2) {
					if (ip[i] === "*") {
						this.err = err.pre+addr;
						break;
					}
				}
				if (ip[i] === "" || ip[i] === null || ip[i] === "undefined") {
					this.err = err.pre + addr + err.empty;
					break;
				}
				if (Number(ip[i]) < 0 || Number(ip[i]) > 255) {
					this.err = err.pre + addr + err.val;
					break;
				}
				if ($.isNumeric(ip[i]))
					continue;
				if (ip[i].indexOf('-') != -1) {
					var range = ip[i].split("-");
					if (!$.isArray(range)) {
						this.err = err.pre + addr
						break;
					} else if (!$.isNumeric(range[0]) || !$.isNumeric(range[1])) {
						this.err = err.pre + addr;
						break;
					} else if (Number(range[0]) < 0 || Number(range[0]) > 255) {
						this.err = err.pre + addr + err.val;
						break;
					} else if (Number(range[1]) < 0 || Number(range[1]) > 255) {
						this.err = err.pre + addr + err.val;
						break;
					}
				} else if (ip[i] === "*") {
					continue;
				} else if (ip[i].indexOf('@') != -1) {
					this.err = err.pre + ip + err.location;
					break;
				} else if (ip[i].indexOf('/') != -1) {
					this.err = err.pre + ip + err.path;
					break;
				} else {
					this.err = err.pre + addr;
					break;
				}
			}
		} else
			this.err = err.pre+addr+err.oletus;

		return !this.err;
	},

	check: function(tgt, msgShow) {
		this.elm = (tgt ? $(tgt) : $('#iprajoitus'));
		var str = this.elm.val();
		if (str !== "" && str !== "undefined") {
			var ips = str;
			ips = ips.replace(/\;/g, ',');
			ips = ips.replace(/ /g, '');
			ips = (ips.indexOf(',') > -1 ? ips.split(',') : ips);

			this.indicate();

			if (str.length == this.stringLength) {
				this.err = this.errMsg.len;
				if (!this.gotit && !msgShow)
					alert(gettext(this.err));
				this.indicate();
				this.gotit = true;
			} else if ($.isArray(ips)) {
				if (ips.length <= this.nrOfIps) {
					for (var i in ips) {
						if (!this.validate(ips[i]))
							break;
					}
				} else
					this.err = this.errMsg.max;
			} else {
				if (!this.validate(ips))
					var err = this.err;
			}

			if (this.err) {
				if (msgShow) {
					alert(this.err);
					this.indicate();
				}
				this.err = false;
				return false;
			}
		}

		this.err = false;
		return true;
	}
};
