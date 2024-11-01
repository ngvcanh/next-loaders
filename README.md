# next-loaders

## Overview

`next-loaders` is a utility library for managing server loader actions in Next.js applications. It provides a set of hooks and context providers to handle server responses, including support for debouncing, throttling, and retry mechanisms. This library ensures consistent response structures and centralized state management for server actions.

### Features

- **Loader Context Provider**: Manages the state of server loader responses in a centralized context.
- **createLoader Utility**: Creates and manages loader actions with support for debouncing, throttling, and retry mechanisms.
- **Response Utility**: Provides helper functions to create standardized success and error responses.
- **useDebounce Hook**: Delays the execution of a callback function until after a specified delay has elapsed since the last invocation.
- **useThrottle Hook**: Ensures a callback function is not called more often than the specified delay.

### Installation

```sh
npm i next-loaders
```

OR (yarn)

```sh
yarn add next-loaders
```

## useDebounce Hook

The `useDebounce` hook is a custom React hook that delays the execution of a callback function until after a specified delay has elapsed since the last time the debounced function was invoked. This is useful for scenarios where you want to limit the rate at which a function is executed, such as handling user input events.

### Usage

#### Parameters

- `callback` (Function): The function to be debounced.
- `delay` (number): The delay in milliseconds to wait before executing the callback function.

#### Returns

- A debounced version of the callback function.

#### Example

```tsx
import React, { useState } from 'react';
import useDebounce from 'next-loaders/use-debounce';

function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce((term) => {
    // Perform search operation
    console.log('Searching for:', term);
  }, 500);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    debouncedSearch(event.target.value);
  };

  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={handleChange}
        placeholder="Search..."
      />
    </div>
  );
}

export default SearchComponent;
```

In this example, the `debouncedSearch` function will only be called 500 milliseconds after the user stops typing in the input field.

### Implementation Details

The `useDebounce` hook uses the following React hooks internally:

- `useRef`: To store references to the timeout ID and the callback function.
- `useEffect`: To update the callback reference whenever the callback function changes.
- `useCallback`: To create a memoized debounced function that clears the previous timeout and sets a new one.

## useThrottle Hook

The `useThrottle` hook is a custom React hook that ensures a callback function is not called more often than the specified delay. This is useful for scenarios where you want to limit the rate at which a function is executed, such as handling user input events.

### Usage

#### Parameters

- `callback` (Function): The function to be throttled.
- `delay` (number): The delay in milliseconds to wait before allowing the callback function to be called again.

#### Returns

- A throttled version of the callback function.

#### Example

```tsx
import React, { useState } from 'react';
import useThrottle from 'path/to/use-throttle';

function ScrollComponent() {
  const [scrollPosition, setScrollPosition] = useState(0);
  const throttledScroll = useThrottle((position) => {
    // Handle scroll position
    console.log('Scroll position:', position);
  }, 1000);

  const handleScroll = () => {
    const position = window.scrollY;
    setScrollPosition(position);
    throttledScroll(position);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div>
      <p>Scroll position: {scrollPosition}</p>
    </div>
  );
}

export default ScrollComponent;
```

In this example, the `throttledScroll` function will only be called once every 1000 milliseconds while the user is scrolling.

### Implementation Details

The `useThrottle` hook uses the following React hooks internally:

- `useRef`: To store references to the timeout ID and the last run time.
- `useEffect`: To update the callback reference whenever the callback function changes.
- `useCallback`: To create a memoized throttled function that ensures the callback is not called more often than the specified delay.

## Response Utility

The `response` utility provides helper functions to create standardized success and error responses for server actions or server loaders in Next.js applications. This utility ensures consistent response structures across your application.

### Usage

#### Methods

- `success<T>(data: T, message?: string): LoaderServerSuccess<T>`
  - Creates a success response.
  - **Parameters:**
    - `data` (T): The data to be included in the success response.
    - `message` (string, optional): An optional message to include in the response.
  - **Returns:** An object with `success` set to `true`, and includes the provided `data` and `message`.

- `error(message: string, detail?: string): LoaderServerFailure`
  - Creates an error response.
  - **Parameters:**
    - `message` (string): The error message.
    - `detail` (string, optional): Additional details about the error.
  - **Returns:** An object with `success` set to `false`, and includes the provided `message` and `detail`.

### Example

```ts
"use server";

import response from 'next-loaders/response';

export const loader = async () => {
  try {
    const data = { key: 'value' };
    return response.success(data, 'Action was successful');
  } catch (error) {
    return response.error('An error occurred', error.message);
  }
};
```

In this example, the `response` utility is used to create standardized success and error responses for a Next.js server loader. 

### Implementation Details

The `response` utility uses the following types:

- `LoaderServerSuccess<T>`: Represents a successful response.
  - **Properties:**
    - `success` (boolean): Indicates the success of the response.
    - `data` (T): The data included in the response.
    - `message` (string, optional): An optional message.

- `LoaderServerFailure`: Represents a failed response.
  - **Properties:**
    - `success` (boolean): Indicates the failure of the response.
    - `message` (string): The error message.
    - `detail` (string, optional): Additional details about the error.

## Loader Context Provider

The `LoaderContext` provider is a React context provider that manages the state of server loader responses in a Next.js application. It provides a way to store, update, and reset loader responses in a centralized context.

### Usage

#### Types

- `LoaderState`: Represents the state of loader responses, which is a record of loader names and their corresponding responses.
- `LoaderValue`: Represents the value provided by the `LoaderContext`, including the state and methods to set and reset loader responses.

#### Methods

- `setLoader(result: LoaderServerResponse<any>, name: string): void`
  - Sets the loader response for a given loader name.
  - **Parameters:**
    - `result` (LoaderServerResponse<any>): The loader response to be set.
    - `name` (string): The name of the loader.

- `reset(name: string): void`
  - Resets the loader response for a given loader name.
  - **Parameters:**
    - `name` (string): The name of the loader to be reset.

- `resetAll(): void`
  - Resets all loader responses.

### Example

```tsx
"use client";

import React from 'react';
import { LoaderProvider } from 'path/to/providers';

const MyComponent = ({ children }) => {
  return (
    <LoaderProvider>
      {children}
    </LoaderProvider>
  );
};

export default MyComponent;
```

In this example, the `LoaderContext` provider is used to manage the state of loader responses in a React component.

### Implementation Details

The `LoaderContext` provider uses the following React hooks internally:

- `useReducer`: To manage the state of loader responses.
- `useMemo`: To memoize the context value.

## createLoader Utility

The `createLoader` utility is a custom hook that integrates with the `LoaderContext` to manage server loader actions in a Next.js application. It provides a way to create and manage loader actions with support for debouncing, throttling, and retry mechanisms.

### Usage

#### Parameters

- `name` (string): The name of the loader action.
- `action` (LoaderServerAction): The server action to be executed.

#### Returns

- A custom hook that returns the loader response and an object with methods to manage the loader action.

#### Example

```tsx
import React, { useEffect, useMemo } from 'react';
import createLoader from 'path/to/create-loader';
import { getAdminUsers, getDefaultUsers } from './loader';

const MyComponent = () => {
  const useAdminUsers = useMemo(() => createLoader("getAdminUsers", getAdminUsers), []);
  const useInitialUsers = createLoader("getDefaultUsers", getDefaultUsers);

  const [admins, loader] = useAdminUsers();
  const [, getInitialUsers] = useInitialUsers();

  useEffect(() => {
    loader.throttle();
    return () => loader.cancel();
  }, [loader]);

  useEffect(() => {
    getInitialUsers.load();
    return () => getInitialUsers.cancel();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <h1>Admin Users</h1>
      {admins && admins.data && admins.data.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
};

export default MyComponent;
```

In this example, the `createLoader` utility is used to create and manage loader actions for fetching admin users and initial users. The `loader` object provides methods to throttle and cancel the loader action, while the `getInitialUsers` object provides methods to load and cancel the initial users loader action.

### Implementation Details

The `createLoader` utility uses the following React hooks internally:

- `useContext`: To access the `LoaderContext`.
- `useMemo`: To memoize the loader action.
- `useCallback`: To create memoized versions of the loader methods.
- `useRef`: To store references to the loader state and actions.
