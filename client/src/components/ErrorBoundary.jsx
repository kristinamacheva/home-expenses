import { Component } from 'react';
import ErrorFallback from './error-fallback/ErrorFallback';

// for problems in rendering
export default class ErrorBoundary extends Component {
    constructor() {
        super()

        this.state = {
            hasError: false,
        }
    }

    static getDerivedStateFromError(err) {
        //the new state of the component
        return {
            hasError: true,
        }
    }

    componentDidCatch(error, errorInfo) {
        console.log(`${error}: ${errorInfo}`)
    }

    resetErrorState = () => {
        this.setState({ hasError: false });
    };

    render() {
        if (this.state.hasError) {
            return <ErrorFallback resetErrorState={this.resetErrorState} />;
        }

        return this.props.children;
    }
}