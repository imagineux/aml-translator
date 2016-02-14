const aml_translator = (function () {
  'use strict';

  const char_map = {
    '^%': '<STRONG>',
    '^!%': '</STRONG>',
    '^~': '<EM>',
    '^!~': '</EM>'
  };

  function insert (string, substring, index) {
    return string.slice(0, index).concat(substring, string.slice(index));
  }

  function extact_name (string) {
    return string.replace(/\W/g, '');
  }

  function is_open_bracket (string) {
    return (string.indexOf('/') === -1);
  }

  function make_tag (name, state) {
    return (state === 'closed') ? '</' + name  + '>' : '<' + name + '>';
  }

  function parse_html (string) {
    const length = string.length;
    let start = 0;
    let open_tag;

    while (start < length) {
      start = string.indexOf('<', start);
      let end = string.indexOf('>', start) + 1;
      let bracket = string.substring(start, end);
      let last_tag = open_tag;
      let current_tag = extact_name(bracket);

      if (is_open_bracket(bracket)) {
        open_tag = current_tag;
      } else {
        if (last_tag !== current_tag) {
          let tag_closed = make_tag(last_tag,'closed');
          let tag_open = make_tag(last_tag);
          string = insert(insert(string, tag_open , end), tag_closed, start);
          end = string.indexOf(tag_open, end) + tag_open.length;
        } else {
          open_tag = null;
        }
      }
      start = end;
    }
    return string;
  }

  function replace_syntax (string) {
    Object.keys(char_map)
      .forEach((value) => string = replace_all(string, value, char_map[value]));

    return string;
  }

  function replace_all (string, target, replacement) {
    return string.split(target).join(replacement);
  }

  function translate (string) {
    let new_string = replace_syntax(string);
    return string === new_string ? string : parse_html(new_string);
  }

  return {
    translate: translate
  };
})();

if (module.exports) {
  module.exports = aml_translator;
}
