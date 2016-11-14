/* hints.js for chrome - Nibble<.ds@gmail.com> */

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
	var key = evt.key,
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
	if (pressedKey == 'Backspace')
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
