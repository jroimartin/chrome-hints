/* hints.js for chrome - Nibble<.gs@gmail.com> */

/* Config */
var homerow = 'asdfhjkl';
var key_cancel = 'C-c';
var key_go = 'Enter';
var key_top = 'C-a';
var key_blank = 'C-A';
var style_label = {"color":"black","fontSize":"12px","backgroundColor":"#FF7A7A","fontWeight":"bold","margin":"0px","padding":"0px","position":"absolute","zIndex":99};
var style_hl = {"backgroundColor":"#00FF00"};

/* Global vars */
var hint_num_str = '';
var hint_elems = [];
var spans = [];
var hint_open_in_new_tab = false;
var keyid = {
	"U+0008" : "BackSpace", "U+0009" : "Tab", "U+0018" : "Cancel",
	"U+001B" : "Esc", "U+0020" : "Space", "U+0021" : "!", "U+0022" : "\"",
	"U+0023" : "#", "U+0024" : "$", "U+0026" : "&", "U+0027" : "'",
	"U+0028" : "(", "U+0029" : ")", "U+002A" : "*", "U+002B" : "+",
	"U+002C" : ",", "U+002D" : "-", "U+002E" : ".", "U+002F" : "/",
	"U+0030" : "0", "U+0031" : "1", "U+0032" : "2", "U+0033" : "3",
	"U+0034" : "4", "U+0035" : "5", "U+0036" : "6", "U+0037" : "7",
	"U+0038" : "8", "U+0039" : "9", "U+003A" : ":", "U+003B" : ";",
	"U+003C" : "<", "U+003D" : "=", "U+003E" : ">", "U+003F" : "?",
	"U+0040" : "@", "U+0041" : "a", "U+0042" : "b", "U+0043" : "c",
	"U+0044" : "d", "U+0045" : "e", "U+0046" : "f", "U+0047" : "g",
	"U+0048" : "h", "U+0049" : "i", "U+004A" : "j", "U+004B" : "k",
	"U+004C" : "l", "U+004D" : "m", "U+004E" : "n", "U+004F" : "o",
	"U+0050" : "p", "U+0051" : "q", "U+0052" : "r", "U+0053" : "s",
	"U+0054" : "t", "U+0055" : "u", "U+0056" : "v", "U+0057" : "w",
	"U+0058" : "x", "U+0059" : "y", "U+005A" : "z", "U+00DB" : "[",
	"U+00DC" : "\\", "U+00DD" : "]", "U+005E" : "^", "U+005F" : "_",
	"U+0060" : "`", "U+007B" : "{", "U+007C" : "|", "U+007D" : "}",
	"U+007F" : "Delete", "U+00A1" : "¡", "U+0300" : "CombGrave",
	"U+0300" : "CombAcute", "U+0302" : "CombCircum", "U+0303" : "CombTilde",
	"U+0304" : "CombMacron", "U+0306" : "CombBreve", "U+0307" : "CombDot",
	"U+0308" : "CombDiaer", "U+030A" : "CombRing", "U+030B" : "CombDblAcute",
	"U+030C" : "CombCaron", "U+0327" : "CombCedilla", "U+0328" : "CombOgonek",
	"U+0345" : "CombYpogeg", "U+20AC" : "\u20ac", "U+3099" : "CombVoice",
	"U+309A" : "CombSVoice",
	//"U+005B" : "[",
	//"U+005C" : "\\",
	//"U+005D" : "]",
};

function add_keybind(key, func, eve) {
	var pressed_key = get_key (eve);
	if (pressed_key == key) {
		eve.preventDefault ();  //Stop Default Event 
		eval (func);
	}
}

function decode_tag(tag) {
	var ret = 0;
	for (var i = 0; i < tag.length; i++)
		ret += homerow.indexOf (tag[tag.length-i-1])*Math.pow (homerow.length, i);
	return ret;
}

function encode_tag(i) {
	var ret = "", Q = i, R;
	while (true) {
		R = Q%homerow.length;
		ret = homerow.charAt(R)+ret;
		Q = (Q-R)/homerow.length;
		if (Q==0) break;
	}
	return ret;
}

function exec_select(elem) {
	var tag_name = elem.tagName.toLowerCase ();
	var type = elem.type ? elem.type.toLowerCase () : "";
	if (tag_name == 'a' && elem.href != '') {
		// TODO: ajax, <select>
		if (hint_open_in_new_tab)
			window.open (elem.href);
		else location.href = elem.href;
	} else if (tag_name == 'input' && (type == "submit" || type == "button" || type == "reset")) {
		elem.click ();
	} else if (tag_name == 'input' && (type == "radio" || type == "checkbox")) {
		// TODO: toggle checkbox
		elem.checked = !elem.checked;
	} else if (tag_name == 'input' || tag_name == 'textarea') {
		elem.focus ();
		elem.setSelectionRange (elem.value.length, elem.value.length);
	}
	remove_hints ();
}

function get_key(evt) {
	var key = keyid[evt.keyIdentifier] || evt.keyIdentifier,
		ctrl = evt.ctrlKey ? 'C-' : '',
		meta = evt.metaKey ? 'M-' : '',
		alt = evt.altKey ? 'A-' : '';
	if (evt.shiftKey && /^[a-z]$/.test (key))
		key = key.toUpperCase ();
	return ctrl+meta+alt+key;
}

function hint_handler(e) {
	e.preventDefault ();  //Stop Default Event 
	var pressedKey = get_key (e);
	if (pressedKey == 'BackSpace')
		hint_num_str = hint_num_str.slice (0, -1);
	if (pressedKey == key_go) {
		if (hint_num_str == '')
			hint_num_str = 'a';
		judge_hint_num (decode_tag (hint_num_str));
	} else if (pressedKey == key_cancel) {
		remove_hints ();
	} else {
		if (homerow.indexOf (pressedKey) != -1)
			hint_num_str += pressedKey;
		var hint_num = decode_tag (hint_num_str);
		set_highlight (hint_num);
	}
}

function hint_mode(newtab) {
	if (newtab)
		hint_open_in_new_tab = true;
	else hint_open_in_new_tab = false;
	set_hints ();
	document.removeEventListener ('keydown', init_keybind, false);
	document.addEventListener ('keydown', hint_handler, false);
}

function init_keybind(e) {
	var t = e.target;
	if( t.nodeType == 1) {
		add_keybind(key_top, 'hint_mode ()', e);
		add_keybind(key_blank, 'hint_mode (true)', e);
	}
}

function judge_hint_num(hint_num) {
	var hint_elem = hint_elems[hint_num];
	if (hint_elem != undefined)
		exec_select(hint_elem);
	else remove_hints ();
}

function remove_hints() {
	for(var id in spans)
		spans[id].style.visibility="hidden";
	hint_elems = [];
	spans = [];
	hint_num_str = '';
	document.removeEventListener ('keydown', hint_handler, false);
	document.addEventListener ('keydown', init_keybind, false);
}

function set_highlight(hint_num) {
	for (var s in spans) {
		if (s == hint_num)
			for (var st in style_hl)
				spans[s].style[st] = style_hl[st];
		else
			for (var st in style_label)
				spans[s].style[st] = style_label[st];
	}
}

function set_hints() {
	var win_top = window.scrollY;
	var win_bottom = win_top + window.innerHeight;
	// TODO: <area>
	var elems = document.body.querySelectorAll ('a, input:not([type=hidden]), textarea, select, button');
	for (var i = 0; i < elems.length; i++) {
		var elem = elems[i];
		var pos = elem.getBoundingClientRect ();
		if (pos.height == 0 || pos.width == 0)
			continue;
		var elem_top = win_top + pos.top;
		var elem_bottom = win_top + pos.bottom;
		if ( elem_bottom >= win_top && elem_top <= win_bottom) {
			hint_elems.push (elem);
			span = document.createElement ('span');
			for (var s in style_label)
				span.style[s]=style_label[s];
			span.innerHTML = encode_tag (hint_elems.length-1);
			spans.push (span);
			elem.parentNode.insertBefore(span, elem);
		}
	}
	set_highlight (0);
}

document.addEventListener ('keydown', init_keybind, false);
