import React, {Component} from 'react';
import { Button } from 'antd-mobile';
import request from "../../utils/request";

/**
 * @author hui
 * @date 2019/2/18
 * @Description: 朋友圈 - 列表
 */
class DynamicList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dynaminList:[],           //动态列表
            currentIndex:-1,          //當前歌曲
            currentUrl:null,          //当前音乐地址
            currentVideoUrl:null,     //当前视频地址
        }
    }

    componentDidMount() {
        //获取动态
        request('event').then(data =>{
            if(data.data.code === 200){
                this.setState({
                    dynaminList:data.data.event
                });
            }
        })

        const audio = this.refs.audio;
        audio.addEventListener('ended', this.isEnd, false);
    }

    //判断歌曲是否播放完畢
    isEnd = ()=>{
      console.log('播放完毕');
      this.setState({
          currentIndex:-1
      });
    }

    //播放|暂停音乐
    playAudio = (index,id)=>{
      const audio = this.refs.audio;
      //开始播放
      if(audio && this.state.currentIndex !== index){
        audio.volume = 0.5;

        //获取歌曲MP3地址
        request(`music/url?id=${id}`).then(data=>{
          if(data.data.code === 200){
            this.setState({
              currentUrl:data.data.data[0].url,
              currentIndex:index
            },()=> audio.play());
          }
        });
      }else if(audio && this.state.currentIndex === index){
          audio.pause();
          this.setState({currentIndex:-1});
      }
    }

    //获取视频MP4地址
    getVideoUrl = (v, id, index)=>{
        const video = document.getElementById(v);

        request(`video/url?id=${id}`).then(data => {
            if (data.data.code === 200) {
                this.setState({
                    currentVideoUrl:data.data.urls[0].url,
                    currentIndex:index
                },()=>{
                    video.load();   ////重新加载src指定的资源
                    video.play();
                });
            }
        });
    }

    //时间转换
    getTime = (val)=>{
        const date = new Date(val);
        const year = date.getFullYear();
        const month = date.getMonth()+1;
        const day = date.getDate();
        const h = date.getHours();
        const m = date.getMinutes();
        return year+'-'+month+'-'+day + ' ' + h + ':' + m;
    }

    //关注
    setAtten = (id, followed)=>{
      const follow = followed ? 2 : 1;
      console.log(follow)
      request(`follow?id=${id}&t=${follow}`).then(data => {
        /*if (data.data.code === 201) {
          alert('已添加关注');
        }
        if (data.data.code === 200) {
          alert('已添加关注');
        }*/
        if (!followed) {
          alert('已添加关注');
        }else{
          alert('已取消关注');
        }
      });
    }

    render() {
        const { dynaminList,currentIndex,currentUrl,currentVideoUrl } = this.state;


        return (
            <div className="m-dis-dynamic" style={{height: 'calc(100% - 45px)', overflowY: 'auto'}}>
                <audio
                  // controls   //显示原始样式
                  src={currentUrl}
                  ref='audio'
                  preload="true"
                />

                {/*列表*/}
                    {
                        dynaminList.splice(0,8).map((item, index) =>{
                            const json = JSON.parse(item.json);
                            let val = json.song && json.song.artists.length === 1 && json.song.artists.length > 0 ? '' : '/';
                            if (json.video){
                              // console.log(item.rcmdInfo)
                            }
                            return <div className="m-dis-dynamic-item" key={index}>
                                        <img src={item.user.avatarUrl} alt=""/>
                                        <div className="m-dis-dynamic-item-all">
                                            <div className="m-dis-dynamic-item-all-title">
                                                <span
                                                    className={item.user.followed ? "m-dis-dynamic-item-atten m-atten-y" :"m-dis-dynamic-item-atten"}
                                                    onClick={()=>this.setAtten(item.user.userId, item.user.followed)}>
                                                    {item.user.followed ? '已关注' : <span><i className="icon-d-yh-add"/>关注</span>}
                                                </span>
                                                <p>{item.user.nickname}</p>
                                                <p className="msg"><span>{json.video && item.rcmdInfo !== null ? item.rcmdInfo.userReason : this.getTime(item.showTime)}</span></p>
                                            </div>

                                            <p>{json.msg}</p>

                                            {/*song*/}
                                            {json.song &&
                                                <div className="m-dis-dynamic-item-all-m">
                                                    {/*id*/}
                                                    <img src={json.song.album.picUrl} alt=""/>
                                                    <span className="play" onClick={()=>this.playAudio(index, json.song.id)}><i className={currentIndex == index ? "icon-bf-zt":"icon-bf-bf"}/></span>
                                                    <div>
                                                        <p>{json.song.name}</p>
                                                        <p>
                                                            {json.song.artists.map((itemA, indexA) => {
                                                                return <span
                                                                    key={indexA}>{indexA === 0 ? '' : val}{itemA.name}</span>
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>
                                            }

                                            {/*video*/}
                                            {json.video &&
                                                <div className="m-dis-dynamic-item-all-mv">
                                                    <video id={`video${index}`} width={`${json.video.width}px`} controls={currentIndex === index ? true:false} preload="none">
                                                        <span>{currentVideoUrl}</span>
                                                        <source src={currentVideoUrl} type="video/mp4" />
                                                    </video>
                                                    <div className="m-dis-dynamic-item-all-mv-img" style={{width: `${json.video.width}`,display:currentIndex === index ? 'none':'block'}}>
                                                        <img src={json.video.coverUrl} />
                                                        <span className="play" onClick={()=>this.getVideoUrl(`video${index}`,json.video.videoId,index)}><i className={currentIndex === index ? "icon-bf-zt":"icon-bf-bf"}/></span>
                                                    </div>
                                                </div>
                                            }

                                            {/*program*/}
                                            {json.program &&
                                              <div className="m-dis-dynamic-item-all-m">
                                                <img src={json.program.radio.picUrl} />
                                                {/*<span className="play" onClick={()=>this.getCurrenturl(json.video.videoId)}><i className={currentIndex == index ? "icon-bf-zt":"icon-bf-bf"}/></span>*/}
                                                <div>
                                                  <p>{json.program.radio.desc}</p>
                                                  <p><span>{json.program.radio.category}</span>{json.program.radio.name}</p>
                                                </div>
                                              </div>
                                            }

                                            {/*img*/}
                                            <div className={item.pics.length > 3 ? "m-dis-dynamic-item-all-c2" : "m-dis-dynamic-item-all-c"}>
                                                {item.pics.map((itemP, indexP) =>{
                                                    return <img key={indexP} src={itemP.originUrl} alt="" />
                                                })}
                                            </div>

                                            <div className='m-dis-dynamic-item-opera'>

                                            </div>
                                        </div>
                                    </div>
                        })
                  }
            </div>
        )
    }
}

export default DynamicList;
