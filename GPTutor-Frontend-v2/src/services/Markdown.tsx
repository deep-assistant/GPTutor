/* eslint-disable */

import MarkdownIt from "markdown-it";
import Prism from "prismjs";

//@ts-ignore
import mila from "markdown-it-link-attributes";

// Импортируем компоненты Prism статически
import 'prismjs/components/prism-go.min.js';
import 'prismjs/components/prism-python.min.js';
import 'prismjs/components/prism-bash.min.js';
import 'prismjs/components/prism-javascript.min.js';
import 'prismjs/components/prism-json.min.js';
import 'prismjs/components/prism-markup.min.js';

const getLanguage = (lang: string) => {
  return !lang || lang === "html" ? "markup" : lang;
};

export default class Markdown {
  markdownItWithPlugins = new MarkdownIt({
    breaks: true,
    langPrefix: "language-",
    linkify: true,
    typographer: false,
    highlight: function (code: string, lang: string) {
      const language = getLanguage(lang);
      const grammar = Prism.languages[language];

      try {
        if (grammar) {
          return Prism.highlight(code, grammar, language);
        }
      } catch (err) {
        console.error(err);
      }

      return code;
    },
  })
    .use(mila, { attrs: { target: "_blank" } });

  markdownIt = new MarkdownIt({
    breaks: true,
    langPrefix: "language-",
    linkify: true,
    typographer: false,
    highlight: function (code: string, lang: string) {
      const language = getLanguage(lang);
      const grammar = Prism.languages[language];

      try {
        if (grammar) {
          return Prism.highlight(code, grammar, language);
        }
      } catch (err) {
        console.error(err);
      }

      return code;
    },
  });

  markdownItHtml = new MarkdownIt({
    breaks: true,
    html: true,
    langPrefix: "language-",
    linkify: true,
    typographer: false,
    highlight: function (code: string, lang: string) {
      const language = getLanguage(lang);
      const grammar = Prism.languages[language];

      try {
        if (grammar) {
          return Prism.highlight(code, grammar, language);
        }
      } catch (err) {
        console.error(err);
      }

      return code;
    },
  })
    .use(mila, { attrs: { target: "_blank" } });

  render(markdown: string) {
    return this.markdownItWithPlugins.render(markdown);
  }

  renderWithoutPlugins(markdown: string) {
    return this.markdownIt.render(markdown);
  }

  renderHtml(markdown: string) {
    return this.markdownItHtml.render(markdown);
  }

}
