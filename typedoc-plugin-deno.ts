import { trim } from 'lodash';
import { Component, ConverterComponent } from 'typedoc/dist/lib/converter/components';
import { Context } from 'typedoc/dist/lib/converter/context';
import { Converter } from 'typedoc/dist/lib/converter/converter';
import { Comment, CommentTag, SignatureReflection } from 'typedoc/dist/lib/models';
import { Reflection, ReflectionKind } from 'typedoc/dist/lib/models/reflections/abstract';

@Component({ name: 'deno' })
export class DenoPlugin extends ConverterComponent {
  initialize() {
    this.listenTo(this.owner, {
      [Converter.EVENT_RESOLVE_END]: this.onEndResolve,
    });
  }

  /** Triggered when the converter has finished resolving a project. */
  private onEndResolve(context: Context) {
    for (let signature of Object.values(context.project.reflections)) {
      const comment = signature.comment as Comment & I18nComment;
      if (!comment) {
        continue;
      }

      processi18nLineByLine(comment);

      if (!isSignature(signature)) {
        continue;
      }

      if (comment && comment.hasTag('returns_i18n')) {
        comment.returns_i18n = comment.getTag('returns_i18n')!.text;
        comment.removeTags('returns_i18n');
      }

      if (!signature.parameters) {
        continue;
      }

      for (let parameter of signature.parameters) {
        const tag = getI18nParamTag(comment, parameter.name);
        if (!tag) {
          continue;
        }
        (parameter.comment as Comment & I18nComment).text_i18n = tag.text.replace(parameter.name, '').trim();
        (parameter.comment as Comment & I18nComment).shortText_i18n = '';
      }
      comment.removeTags('param_i18n');

      if (!signature.typeParameters) {
        continue;
      }

      for (let parameter of signature.typeParameters) {
        const tag = getI18nTypeParamTag(comment, parameter.name);
        if (!tag) {
          continue;
        }
        (parameter.comment as Comment & I18nComment).text_i18n = tag.text.replace(parameter.name, '').trim();
        (parameter.comment as Comment & I18nComment).shortText_i18n = '';
      }
      comment.removeTags('typeparam_i18n');
      comment.removeTags('template_i18n');
    }
  }
}

function processi18nLineByLine(comment: Comment & I18nComment): void {
  if (!comment) {
    return;
  }

  comment.text = trim(comment.text, '\n');

  if (!comment.tags) {
    return;
  }

  const tags = comment.tags;

  comment.text_line_i18n = [];
  comment.text_line_en = [];

  comment.shortText_i18n = '';

  let i = 0;
  let c = tags.length;
  while (i < c) {
    const text = trim(tags[i].text, '\n');
    if (tags[i].tagName === 'i18n' && text !== '') {
      const [one, two, ...others] = text.split('\n\n');

      comment.text_line_i18n.push(one);
      comment.text_line_en.push(two || '');

      for (let line of others) {
        comment.text_line_en.push(line);
        comment.text_line_i18n.push('');
      }
    }

    if (tags[i].tagName === 'i18n') {
      // Remove tag
      tags.splice(i, 1);
      c--;
    } else {
      // Process next tag
      i++;
    }
  }

  if (comment.text_line_i18n.length === 0) {
    return;
  }

  if (comment.text === '') {
    // shortText has been translated
    comment.shortText_i18n = comment.text_line_i18n.shift();
    comment.text = comment.text_line_en.join('\n\n');
  } else {
    comment.text_line_en.unshift(comment.text);
    comment.text = comment.text_line_en.join('\n\n');
  }

  comment.text_line_i18n.push('');
}

function isSignature(reflection: Reflection): reflection is SignatureReflection {
  return reflection.kindOf(ReflectionKind.SomeSignature);
}

function getI18nParamTag(comment: Comment, paramName?: string): CommentTag | undefined {
  if (!comment.tags) {
    return undefined;
  }
  return comment.tags.find((tag) => tag.tagName === 'param_i18n' && tag.text.startsWith(paramName));
}

function getI18nTypeParamTag(comment: Comment, paramName?: string): CommentTag | undefined {
  if (!comment.tags) {
    return undefined;
  }
  return comment.tags.find(
    (tag) => (tag.tagName === 'typeparam_i18n' || tag.tagName === 'template_i18n') && tag.text.startsWith(paramName),
  );
}

interface I18nTag {
  text_i18n: string;
}

interface I18nComment extends I18nTag {
  shortText_i18n: string;
  text_line_i18n: string[];
  text_line_en: string[];
  returns_i18n: string;
}
