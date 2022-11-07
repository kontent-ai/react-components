import React from 'react';
import parseHTML, { domToReact, DOMNode, HTMLReactParserOptions, Element } from 'html-react-parser';
import { Elements, IContentItem, ILink, IRichTextImage } from '@kontent-ai/delivery-sdk';

const IMAGE_ID_ATTRIBUTE_IDENTIFIER = 'data-image-id';
const LINKED_ITEM_ID_ATTRIBUTE_IDENTIFIER = 'data-item-id';

// Use custom guard instead of the `instanceof` check because it seems to be broken now (see https://github.com/remarkablemark/html-react-parser/issues/633)
const isElement = (domNode: DOMNode): domNode is Element =>
  domNode.type === 'tag';

const isLinkedItem = (domNode: DOMNode): domNode is Element =>
  isElement(domNode) &&
  domNode.tagName === 'object' &&
  domNode.attributes.find(attr => attr.name === 'type')?.value === 'application/kenticocloud';

const isImage = (domNode: DOMNode): domNode is Element =>
  isElement(domNode) &&
  domNode.tagName === 'figure' &&
  domNode.attributes.find(attr => attr.name === IMAGE_ID_ATTRIBUTE_IDENTIFIER)?.value !== 'undefined';

const isLinkedItemLink = (domNode: DOMNode): domNode is Element =>
  isElement(domNode) &&
  domNode.tagName === 'a' &&
  domNode.attributes.find(attr => attr.name === LINKED_ITEM_ID_ATTRIBUTE_IDENTIFIER)?.value !== 'undefined';

export type DOMToReactFunction = (
  nodes: DOMNode[],
  options?: HTMLReactParserOptions | undefined,
) => string | JSX.Element | JSX.Element[]


export type DomElementOptionsType = {
  domElement: Element,
  domToReact: DOMToReactFunction
};

export type ResolveLinkedItemType = (
  linkedItem: IContentItem | undefined,
  domOptions: DomElementOptionsType,
) => JSX.Element | JSX.Element[] | undefined | null | false

export type ResolveImageType = (
  image: IRichTextImage,
  domOptions: DomElementOptionsType,
) => JSX.Element | JSX.Element[] | undefined | null | false

export type ResolveLinkType = (
  link: ILink,
  domOptions: DomElementOptionsType,
) => JSX.Element | JSX.Element[] | undefined | null | false

export type ResolveDomNodeType = (
  domOptions: {
    domNode: DOMNode,
    domToReact: DOMToReactFunction
  },
) => JSX.Element | JSX.Element[] | undefined | null | false


const replaceNode = (
  domNode: DOMNode,
  richTextElement: Elements.RichTextElement,
  resolveLinkedItem?: ResolveLinkedItemType,
  resolveImage?: ResolveImageType,
  resolveLink?: ResolveLinkType,
  resolveDomNode?: ResolveDomNodeType,
): JSX.Element | object | void | undefined | null | false => {

  const { images, links } = richTextElement;
  if (resolveLinkedItem && richTextElement.linkedItems) {
    if (isLinkedItem(domNode)) {
      const node = domNode;
      const codeName = node?.attributes.find(attr => attr.name === 'data-codename')?.value;
      const linkedItem = codeName ? richTextElement.linkedItems.find(item => item.system.codename === codeName)
        : undefined;
      return resolveLinkedItem(linkedItem, { domElement: node, domToReact });
    }
  }

  if (resolveImage && images) {
    if (isImage(domNode)) {
      const node = domNode;
      const imageId = node?.attributes.find(attr => attr.name === IMAGE_ID_ATTRIBUTE_IDENTIFIER)?.value;
      const image = images.find((image: { imageId: string }) => image.imageId === imageId);
      if (image) {
        return resolveImage(image, { domElement: node, domToReact });
      }
    }
  }

  if (resolveLink && links) {
    if (isLinkedItemLink(domNode)) {
      const node = domNode;

      const linkId = node?.attributes.find(attr => attr.name === LINKED_ITEM_ID_ATTRIBUTE_IDENTIFIER)?.value;
      const link = links.find((link: { linkId: string }) => link.linkId === linkId);
      if (link) {
        return resolveLink(link, { domElement: node, domToReact });
      }
    }
  }

  if (resolveDomNode) {
    return resolveDomNode({ domNode, domToReact });
  }
};

export type ResolversType = {
  resolveLinkedItem?: ResolveLinkedItemType;
  resolveImage?: ResolveImageType;
  resolveLink?: ResolveLinkType;
  resolveDomNode?: ResolveDomNodeType;
}

export type IReactRichTextElementProps = {
  richTextElement: Elements.RichTextElement,
  resolvers?: ResolversType

};

export const RichTextElement: React.FC<IReactRichTextElementProps> = ({
  richTextElement,
  resolvers: resolvers,
}) => {

  // To avoid type error in case resolvers is undefined
  const {
    resolveLinkedItem,
    resolveImage,
    resolveLink,
    resolveDomNode,
  } = { ...resolvers };


  const cleanedValue = richTextElement.value.replace(/(\n|\r)+/, '');
  const result = parseHTML(cleanedValue, {
    replace: (domNode) => replaceNode(domNode, richTextElement, resolveLinkedItem, resolveImage, resolveLink, resolveDomNode),
  });

  return <>{result}</>;
};
