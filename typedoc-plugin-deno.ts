import * as ts from 'typescript';
import { trim } from 'lodash';
import { Component, ConverterComponent } from 'typedoc/dist/lib/converter/components';
import { Context } from 'typedoc/dist/lib/converter/context';
import { Converter } from 'typedoc/dist/lib/converter/converter';
import { Comment, CommentTag } from 'typedoc/dist/lib/models';
import { Reflection } from 'typedoc/dist/lib/models/reflections/abstract';
import {
  ParameterReflection,
  TypeParameterReflection,
  SignatureReflection,
  DeclarationReflection,
} from 'typedoc/dist/lib/serialization/schema';

@Component({ name: 'deno' })
export class DenoPlugin extends ConverterComponent {
  initialize() {
    this.listenTo(this.owner, {
      [Converter.EVENT_CREATE_DECLARATION]: this.onDeclaration,
      [Converter.EVENT_CREATE_SIGNATURE]: this.onSignature,
      [Converter.EVENT_CREATE_PARAMETER]: this.onParameter,
      [Converter.EVENT_CREATE_TYPE_PARAMETER]: this.TypeParameter,
    });
  }

  /**
   * Triggered when the converter has created a parameter reflection.
   * @todo Maybe not usefull
   *
   * @param context  The context object describing the current state the converter is in.
   * @param reflection  The reflection that is currently processed.
   * @param node  The node that is currently processed if available.
   */
  private onParameter(context: Context, reflection: ParameterReflection, node?) {
    if (!reflection.comment) return;
    const comment = reflection.comment;
  }

  /**
   * Triggered when the converter has created a type parameter reflection.
   * @todo Maybe not usefull
   *
   * @param context  The context object describing the current state the converter is in.
   * @param reflection  The reflection that is currently processed.
   * @param node  The node that is currently processed if available.
   */
  private TypeParameter(context: Context, reflection: Reflection, node?) {
    if (!reflection.comment) return;
    const comment = reflection.comment;
  }

  /**
   * Triggered when the converter has created a declaration reflection.
   *
   * @param context  The context object describing the current state the converter is in.
   * @param reflection  The reflection that is currently processed.
   * @param node  The node that is currently processed if available.
   */
  private onSignature(context: Context, reflection: Reflection, node?) {
    if (!reflection.comment) return;
    this.onDeclaration(context, reflection, node);

    if (!reflection.comment.tags) return;
    const tags = reflection.comment.tags as [CommentTag & I18nTag];
    let i = 0;
    let c = tags.length;
    while (i < c - 1) {
      if (tags[i].tagName + '_i18n' === tags[i + 1].tagName) {
        tags[i].text_i18n = tags[i + 1].text.replace(tags[i].paramName, '').trim();
        tags.splice(i + 1, 1);
        c--;
      }
      i++;
    }
  }

  /**
   * Triggered when the converter has created a declaration reflection.
   *
   * @param context  The context object describing the current state the converter is in.
   * @param reflection  The reflection that is currently processed.
   * @param node  The node that is currently processed if available.
   */
  private onDeclaration(context: Context, reflection: Reflection, node?) {
    if (!reflection.comment) return;

    const comment = reflection.comment as Comment & I18nComment;
    comment.text = trim(comment.text, '\n');

    if (!comment.tags) return;

    const i18nTag = comment.tags.find((x) => (x.tagName = '_i18n'));

    if (i18nTag === undefined) return;

    const i18n = trim(i18nTag.text, '\n');
    const firstLF = i18n.indexOf('\n');

    if (firstLF === -1) {
      comment.shortText_i18n = i18n;
      comment.text_i18n = '';
    } else {
      comment.shortText_i18n = i18n.substr(0, firstLF);
      comment.text_i18n = i18n.substr(firstLF + 1);
    }

    removeTags(comment, '_i18n');
    if (isEmptyComment(comment)) {
      delete reflection.comment;
    }
  }
}

function isEmptyComment(comment: Comment) {
  return !comment || (!comment.text && !comment.shortText && (!comment.tags || comment.tags.length === 0));
}

interface I18nTag {
  text_i18n: string;
}

interface I18nComment extends I18nTag {
  shortText_i18n: string;
}

/**
 * Remove all tags with the given name from the given comment instance.
 *
 * @param comment  The comment that should be modified.
 * @param tagName  The name of the that that should be removed.
 */
function removeTags(comment: Comment | undefined, tagName: string) {
  if (!comment || !comment.tags) {
    return;
  }

  let i = 0,
    c = comment.tags.length;
  while (i < c) {
    if (comment.tags[i].tagName === tagName) {
      comment.tags.splice(i, 1);
      c--;
    } else {
      i++;
    }
  }
}
