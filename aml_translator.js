/*jslint node: true */
"use strict";

const aml_translator = (map) => {

  const char_map = map

  const regex = {
    tag_name: /\W/g,
    any_tag: /<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>/g
  }

  const is_open_bracket = (string) => (string.indexOf('/') === -1)

  const extract_name = (string) => string.replace(regex.tag_name, '')

  const replace_all = (string, target, replacement) => {
    return string.split(target).join(replacement)
  }

  const make_tag = (name, state) => {
    return (state === 'closed') ? '</' + name  + '>' : '<' + name + '>'
  }

  const insert = (string, substring, index) => {
    return string.slice(0, index).concat(substring, string.slice(index))
  }

  const last = (array) => {
    const length = array ? array.length : 0
    return length ? array[length - 1] : undefined;
  }

  const parse_html = (string) => {
    let is_valid = is_html_valid(string)
    return is_valid === true ? string : wrap_tags(string, is_valid)
  }

  const replace_syntax = (string) => {
    Object.keys(char_map)
        .forEach((value) => string = replace_all(string, value, char_map[value]))

    return string
  }

  const wrap_tags = (string, open_tags) => {
    open_tags.reverse()
      .forEach(object => {
        let start_tag_index = index_of_occurrence(string, object.value, object.order)
        let end_tag_index = start_tag_index + object.value.length

        string =
          insert(insert(string, make_tag(object.wrap) , end_tag_index), make_tag(object.wrap,'closed'), start_tag_index)
    })

    return string
  }

  const index_of_occurrence = (string, substring, count) => {
    let first_index = string.indexOf(substring);
    let length_up_to_first_index = first_index + 1;

    if (count === 1) {
      return first_index;
    } else {
      let string_after_first_occurrence = string.slice(length_up_to_first_index)
      let next_occurrence = index_of_occurrence(string_after_first_occurrence, substring, count - 1);

      if (next_occurrence === -1) {
        return -1;
      } else {
        return length_up_to_first_index + next_occurrence;
      }
    }
  }

  const is_html_valid = (string) => {
    let tags_to_wrap = [];
    let counter = {};
    let acc = [];

    string.match(regex.any_tag)
        .forEach(val => {
          counter[val] = counter[val] ? counter[val] + 1 : 1;

          if(is_open_bracket(val)){
            acc.push(val)
          } else if (extract_name(val) === extract_name(last(acc))) {
            acc.pop()
          } else {
            tags_to_wrap.push({
              value: val,
              order: counter[val],
              wrap: extract_name(last(acc))
            })
          }
        })

    return tags_to_wrap.length > 0 ? tags_to_wrap : true
  }

  const translator = () => ({
    translate: (string) => {
      let new_string = replace_syntax(string)
      return string === new_string ? string : parse_html(new_string)
    }
  })

  return Object.assign(
      {},
      translator()
  )
}

if (module.exports) {
  module.exports = aml_translator({
    '^%': '<STRONG>',
    '^!%': '</STRONG>',
    '^~': '<EM>',
    '^!~': '</EM>'
  })
}
