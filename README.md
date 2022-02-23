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

const response = await client.item("<YOUR ITEM CODENAME>)
    .toPromise();

// ...

<RichTextElement
    richTextElement={response.item.elements["bio"] as Elements.RichTextElement}
    linkedItems={response.linkedItems}
    resolveLinkedItem={(linkedItem, domNode) => {
        if (isComponent(domNode)) {
            return (
                <>
                    <h1>Component</h1>
                    <pre>{JSON.stringify(linkedItem, undefined, 2)}</pre>;
                </>
            );
        }

        if (isLinkedItem(domNode)) {
            return (
                <>
                    <h1>Linked item</h1>
                    <pre>{JSON.stringify(linkedItem, undefined, 2)}</pre>;
                </>
            );
        }

        throw new Error("Unknown type of the linked item's dom node");
    }}
    resolveImage={(image, domNode): JSX.Element => (
        <img
            src={image.url}
            alt={image.description ? image.description : image.imageId}
            width="200"
        />
    )}
    resolveLink={(link, domNode, domToReact): JSX.Element => (
        <a href={`/${link.type}/${link.urlSlug}`}>
            {domToReact(domNode.children)}
        </a>
    )}
    resolveDomNode={(domNode, domToReact) => {
        if (domNode instanceof DomHandlerElement && domNode.name === 'table') {
            return <div className="table-wrapper">{domToReact([domNode])}</div>;
        }
    }}
    className="testClassName"
/>

```
