import React from 'react'
import cn from 'classnames'
import { useQueryLoader } from 'hooks'
import * as queries from '../../graphql/queries'
import styles from './styles.scss'

const ListPage = () => {
    const entityDefId = 'Tag'
    const entityFilters = {
        entityDefId,
    }
    return useQueryLoader(queries.entities, {
        variables: { entityDefId, entityFilters },
    })(({ data }) => {
        const { entityDef } = data
        const { totalCount, results: entities } = data.entities
        console.log('entities: ', entities)
        console.log('entityDef: ', entityDef)

        return (
            <div className={cn('container-fluid', styles.containerFluid)}>
                <h1>test</h1>
            </div>
        )
    })
}

export default ListPage
