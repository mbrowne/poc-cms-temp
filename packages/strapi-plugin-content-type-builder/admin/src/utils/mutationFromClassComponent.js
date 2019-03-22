import client from 'apolloClient'

export default function useMutation_fromClassComponent(mutation, options) {
    return client.mutate({mutation, ...options})
}
