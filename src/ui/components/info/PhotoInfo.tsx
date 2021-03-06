import fs from 'fs'
import { clipboard, shell } from 'electron'
import classNames from 'classnames'
import React from 'react'
import { Button, Icon, NonIdealState, Popover, Position, Classes, Menu, MenuItem } from '@blueprintjs/core'
import moment from 'moment'
import BluebirdPromise from 'bluebird'

import { PhotoType, PhotoDetail } from '../../../common/models/Photo'
import { bindMany } from '../../../common/util/LangUtil'

import Toolbar from '../widget/Toolbar'
import FaIcon from '../widget/icon/FaIcon'
import TagEditor from './TagEditor'

import './PhotoInfo.less'

const fsStat = BluebirdPromise.promisify(fs.stat)


const infoIconSize = 24

interface Props {
    style?: any
    className?: any
    isActive: boolean
    photo: PhotoType | null
    photoDetail: PhotoDetail | null
    tags: string[]
    closeInfo: () => void
    setPhotoTags: (photo: PhotoType, tags: string[]) => void
}

interface State {
    masterFileSize: number | null
}

export default class PhotoInfo extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props)
        bindMany(this, 'showPhotoInFolder', 'copyPhotoPath')
        this.state = { masterFileSize: null }
        this.updateMasterFileSize(props)
    }

    componentWillReceiveProps(nextProps: Props) {
        const props = this.props
        if (nextProps.photo !== props.photo) {
            this.updateMasterFileSize(nextProps)
        }
    }

    async updateMasterFileSize(props: Props) {
        this.setState({ masterFileSize: null })
        if (props.photo) {
            const stat = await fsStat(props.photo.master)
            this.setState({ masterFileSize: stat.size })
        }
    }

    showPhotoInFolder() {
        shell.showItemInFolder(this.props.photo.master)
    }

    copyPhotoPath() {
        clipboard.writeText(this.props.photo.master)
    }

    render() {
        const props = this.props
        const state = this.state
        const photo = props.photo

        let body
        if (!props.isActive) {
            body = null
        } else if (photo) {
            const photoMasterSplits = photo.master.split(/[\/\\]/g)
            const momentCreated = moment(photo.created_at)

            body = (
                <>
                    <div className="PhotoInfo-infoRow">
                        <Icon className="PhotoInfo-infoIcon" icon="calendar" iconSize={infoIconSize} />
                        <div className="PhotoInfo-infoBody">
                            <h1>{momentCreated.format('LL')}</h1>
                            <div className="PhotoInfo-minorInfo">
                                {`${momentCreated.format('dd')}, ${momentCreated.format('LT')} \u00b7 ${momentCreated.fromNow()}`}
                            </div>
                        </div>
                    </div>
                    <div className="PhotoInfo-infoRow">
                        <Icon className="PhotoInfo-infoIcon" icon="media" iconSize={infoIconSize} />
                        <div className="PhotoInfo-infoBody">
                            <h1 className="PhotoInfo-infoTitle hasColumns">
                                <div className="PhotoInfo-shrinkable" title={photo.master}>
                                    {photoMasterSplits[photoMasterSplits.length - 1]}
                                </div>
                                <Popover position={Position.BOTTOM_RIGHT}>
                                    <span className={classNames('PhotoInfo-breadcrumbs',  Classes.BREADCRUMBS_COLLAPSED)} />
                                    <Menu>
                                        <MenuItem text="Show photo in folder" onClick={this.showPhotoInFolder} />
                                        <MenuItem text="Copy path" onClick={this.copyPhotoPath} />
                                    </Menu>
                                </Popover>
                            </h1>
                            <div className="PhotoInfo-minorInfo hasColumns">
                                <div>{formatImageMegaPixel(photo.master_width, photo.master_height)}</div>
                                <div>{`${photo.master_width} \u00d7 ${photo.master_height}`}</div>
                                <div>{formatFileSize(state.masterFileSize)}</div>
                            </div>
                        </div>
                    </div>
                    {(photo.camera || photo.aperture || photo.exposure_time || photo.focal_length || photo.iso) &&
                        <div className="PhotoInfo-infoRow">
                            <Icon className="PhotoInfo-infoIcon" icon="camera" iconSize={infoIconSize} />
                            <div className="PhotoInfo-infoBody">
                                {photo.camera &&
                                    <h1>{photo.camera}</h1>
                                }
                                <div className="PhotoInfo-minorInfo hasColumns">
                                    {photo.aperture &&
                                        <div>{`\u0192/${photo.aperture}`}</div>
                                    }
                                    {photo.exposure_time &&
                                        <div>{formatShutterSpeed(photo.exposure_time)}</div>
                                    }
                                    {photo.focal_length &&
                                        <div>{`${photo.focal_length} mm`}</div>
                                    }
                                    {photo.iso &&
                                        <div>{`ISO ${photo.iso}`}</div>
                                    }
                                </div>
                            </div>
                        </div>
                    }
                    <div className="PhotoInfo-infoRow">
                        <FaIcon className="PhotoInfo-infoIcon" name="tags" style={{ fontSize: infoIconSize }} />
                        <TagEditor
                            className="PhotoInfo-tagEditor PhotoInfo-infoBody"
                            photo={props.photo}
                            photoDetail={props.photoDetail}
                            tags={props.tags}
                            setPhotoTags={props.setPhotoTags}
                        />
                    </div>
                </>
            )
        } else {
            // No photo selected
            body = (
                <NonIdealState
                    icon="insert"
                    title="No photo selected"
                    description="Please select a photo on the left."
                />
            )
        }
    
        return (
            <div className={classNames(props.className, 'PhotoInfo bp3-dark')} style={props.style}>
                <Toolbar className="PhotoInfo-topBar">
                    <span className="PhotoInfo-title">Info</span>
                    <div className="pull-right">
                        <Button icon="cross" minimal={true} onClick={props.closeInfo} />
                    </div>
                </Toolbar>
                {body}
            </div>
        )
    }

}


function formatImageMegaPixel(width, height): string {
    const sizeMp = width * height / 1000000
    return `${formatNumber(sizeMp)} MP`
}

function formatFileSize(bytes: number | null): string {
    if (bytes === null) {
        return '...'
    } else if (bytes < 1000) {
        return `${bytes} byte`
    } else if (bytes < 1000000) {
        return `${formatNumber(bytes / 1000)} kB`
    } else {
        return `${formatNumber(bytes / 1000000)} MB`
    }
}

function formatShutterSpeed(exposureTime: number): string {
    return '1/' + Math.round(1 / exposureTime)
}

function formatNumber(value: number, fractionDigits: number = 1): string {
    return value.toLocaleString('en', { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits })
}
