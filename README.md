# React Kontent Components

The package containing React components useful when processing Kontent data to the site.

## Install

```sh
npm install @simply007org/kontent-react-components
```

### Typescript

Components exports their typescript definitions so that you know what data format you need to provide via props and what data format expect from function prop callback arguments.

## Rich text element component

Rich text elements from Kontent could be resolved to React components using [html-react-parser](https://www.npmjs.com/package/html-react-parser) (based on [this article](https://rshackleton.co.uk/articles/rendering-kentico-cloud-linked-content-items-with-react-components-in-gatsby))

This package should make the usage easier. Basically by loading the rich text data and use these components to provide this data and resolution functions.

> More showcases could be found in [RichTextElement.spec.tsx](./tests/components/rich-text-element/RichTextElement.spec.tsx).

```tsx
import { createDeliveryClient, Elements } from '@kentico/kontent-delivery';
import { isComponent, isLinkedItem, RichTextElement } from '@simply007org/kontent-react-components';
import { Element as DomHandlerElement } from 'domhandler';

// ...

const client =  createDeliveryClient({
    projectId: '<YOUR PROJECT ID>'
});

const response = await client.item("<YOUR ITEM CODENAME>"))
    .toPromise();

// ...

<RichTextElement
    richTextElement={response.item.elements["bio"] as Elements.RichTextElement}
    resolutions={{
        resolveLinkedItem: (linkedItem, { domElement, domToReact }) => {
            if (isComponent(domElement)) {
                return (
                    <>
                        <h1>Component</h1>
                        <pre>{JSON.stringify(linkedItem, undefined, 2)}</pre>;
                    </>
                );
            }
            if (isLinkedItem(domElement)) {
                return (
                    <>
                        <h1>Linked item</h1>
                        <pre>{JSON.stringify(linkedItem, undefined, 2)}</pre>;
                    </>
                );
            }
            throw new Error("Unknown type of the linked item's dom node");
        },
        resolveImage: (image, { domElement, domToReact }): JSX.Element => (
            <img
                src={image.url}
                alt={image.description ? image.description : image.imageId}
                width="200"
            />
        ),
        resolveLink: (link, { domElement, domToReact }): JSX.Element => (
            <a href={`/${link.type}/${link.urlSlug}`}>
                {domToReact(domElement.children)}
            </a>
        ),
        resolveDomNode: ({ domNode, domToReact }) => {
            if (domNode instanceof DomHandlerElement && domNode.name === 'table') {
                return <div className="table-wrapper">{domToReact([domNode])}</div>;
            }
        }
    }}
/>

```

### Multilevel resolution

If you want to resolve multiple levels of components and linked items in rich text, it is possible to use the component recursively and reuse the resolution logic.

There is an example when rich text can have `row` components, and these can contains `column` components with html.

```tsx
// resolving functionality
const resolveLinkedItemsRecursively: ResolverLinkedItemType = (
  linkedItem,
  _domNode
) => {
  switch (linkedItem?.system.type) {
    case "row":
      return (
        <div className="row">
          <RichTextElement
            richTextElement={
              linkedItem?.elements["columns"] as Elements.RichTextElement
            }
            // Recursively resolve items in the rich text
            resolutions={{
              resolveLinkedItem: resolveLinkedItemsRecursively,
            }}
          />
        </div>
      );
    case "column":
      return (
        <div className="column">
          <RichTextElement
            richTextElement={
              linkedItem?.elements["content"] as Elements.RichTextElement
            }
            resolutions={{
              resolveLinkedItem: resolveLinkedItemsRecursively,
            }}
          />
        </div>
      );
  }
};

// SO the top level rich text would define
<RichTextElement
  richTextElement={
    multiLevelComponentsRichTextItem.item.elements[
      "content"
    ] as Elements.RichTextElement
  }
  resolutions={{
    resolveLinkedItem: resolveLinkedItemsRecursively,
  }}
/>;
```

> ⚠ Recursive resolution could lead to infinite loops, if you have a circular dependency. To avoid that, you can store the codenames of already processed items and if you hit the same one during resolution, break the resolution chain - this could happen only if you use linked items, not components in rich text.

### Return vs. Mutate DOM Node

By returning the react components in any of resolution function, you stop traversing the DOM tree under the current DOM node (its children). If you just want to avoid that behavior, you can mutate the provided DOM node and return `undefined`.

In this showcase a simple html is being resolved and fpr `<p>` tags and all `<strong>` tags a proper class is being set without stopping and traversing.

```tsx
<RichTextElement
  richTextElement={{
    ...emptyRichText,
    value: "<p>Lorem ipsum with <strong>bold text</strong></p>",
  }}
  resolutions={{
    resolveDomNode: ({ domNode, domToReact }) => {
      if (domNode instanceof DomHandlerElement) {
        if (domNode.name === "strong") {
          domNode.attribs.class = domNode.attribs.class
            ? domNode.attribs.class + " strongClass"
            : "strongClass";
          return undefined;
        } else if (domNode.name === "p") {
          domNode.attribs.class = domNode.attribs.class
            ? domNode.attribs.class + " pClass"
            : "pClass";
          return undefined;
        }
      }
    },
  }}
/>
```

The outcome is

```html
<p className="pClass">
  Lorem ipsum with
  <strong className="strongClass"> bold text </strong>
</p>
```

## Feedback

If you have any feedback, feel free to submit an issue or open a PR!
