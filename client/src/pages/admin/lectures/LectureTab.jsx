import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { useEditLectureMutation, useGetLectureByIdQuery, useRemoveLectureMutation } from '@/features/api/courseApi'
import axios from 'axios'
import { Loader2 } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { API_BASE_URL } from "@/config/apiConfig";

const CHUNK_SIZE = 6 * 1024 * 1024; // 6MB

const LectureTab = () => {
    const [uploadLimit, setUploadLimit] = useState(null);
    const [uploadError, setUploadError] = useState("");
    const [lectureTitle, setLectureTitle] = useState("");
    const [uploadVideoInfo, setUploadVideoInfo] = useState(null);
    const [isFree, setIsFree] = useState(false);
    const [mediaProgress, setMediaProgress] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [btnDisabled, setBtnDisabled] = useState(true);
    const params = useParams();
    const { courseId, lectureId } = params;

    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/v1/media/video-upload-config/${lectureId}`, {withCredentials:true})
            .then(({data}) => setUploadLimit(data.maxBytes)).catch(() => setUploadLimit(null));
    }, [lectureId]);

    const { data: lectureData } = useGetLectureByIdQuery(lectureId);
    const lecture = lectureData?.lecture;

    useEffect(() => {
        if (lecture) {
            setLectureTitle(lecture.lectureTitle);
            setIsFree(lecture.isPreviewFree);
            if (lecture.videoUrl) {
                setUploadVideoInfo({
                    videoUrl: lecture.videoUrl,
                    publicId: lecture.publicId
                });
                setBtnDisabled(false);
            }
        }
    }, [lecture]);

    const [editLecture, { data, isLoading, error, isSuccess }] = useEditLectureMutation();
    const [removeLecture, { data: removeData, isLoading: removeLoading, isSuccess: removeSuccess }] = useRemoveLectureMutation();

    // Direct signed chunked upload: no whole-video request or fixed total timeout.
    const fileChangeHandler = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadError("");
        if (!file.type.startsWith("video/")) {setUploadError("Choose a video file."); return;}
        if (uploadLimit && file.size > uploadLimit) {
            setUploadError(`This account allows ${Math.round(uploadLimit / 1024 / 1024)} MiB per video. Compress the file or split it into lectures.`);
            e.target.value = "";
            return;
        }
        setMediaProgress(true);
        setUploadProgress(0);
        try {
            const {data: config} = await axios.post(`${API_BASE_URL}/api/v1/media/video-upload-signature/${lectureId}`, {size:file.size}, {withCredentials:true});
            setUploadLimit(config.maxBytes);
            const uploadId = crypto.randomUUID();
            let result;
            for (let start = 0; start < file.size; start += CHUNK_SIZE) {
                const end = Math.min(start + CHUNK_SIZE, file.size);
                let response;
                for (let attempt = 0; attempt < 3; attempt++) {
                    const form = new FormData();
                    form.append("file", file.slice(start, end), file.name);
                    for (const [key,value] of Object.entries({api_key:config.apiKey,timestamp:config.timestamp,signature:config.signature,folder:config.folder,public_id:config.public_id,overwrite:"false"})) form.append(key, value);
                    try {
                        response = await axios.post(`https://api.cloudinary.com/v1_1/${config.cloudName}/video/upload`, form, {
                            timeout:120000,
                            headers:{"Content-Range":`bytes ${start}-${end - 1}/${file.size}`,"X-Unique-Upload-Id":uploadId},
                            onUploadProgress:({loaded})=>setUploadProgress(Math.min(99,Math.round((start + loaded) / file.size * 100))),
                        });
                        break;
                    } catch (error) {
                        const status = error.response?.status;
                        if (attempt === 2 || (status && status < 500 && status !== 429)) throw error;
                        await new Promise(resolve=>setTimeout(resolve, 1000 * 2 ** attempt));
                    }
                }
                result = response.data;
            }
            if (!result?.secure_url || !result?.public_id) throw new Error("Storage did not confirm the completed upload.");
            setUploadProgress(100);
            setUploadVideoInfo({videoUrl:result.secure_url,publicId:result.public_id});
            setBtnDisabled(false);
            toast.success("Video uploaded. Save changes to attach it to this lecture.");
        } catch (error) {
            const message = error.response?.data?.message || error.response?.data?.error?.message || error.message || "Video upload failed. Please try again.";
            setUploadError(message);
            toast.error(message);
            e.target.value = "";
        } finally {setMediaProgress(false);}
    };

    const editLectureHandler = async () => {
        console.log("uploadVideoInfo before save:", uploadVideoInfo);
        await editLecture({
            lectureTitle,
            videoInfo: uploadVideoInfo,
            isPreviewFree: isFree,
            courseId,
            lectureId
        });
    };

    const removeLectureHandler = async () => {
        await removeLecture(lectureId);
    };

    useEffect(() => {
        if (isSuccess) toast.success(data.message);
        if (error) toast.error(error.data.message);
    }, [isSuccess, error]);

    useEffect(() => {
        if (removeSuccess) toast.success(removeData.message);
    }, [removeSuccess]);

    return (
        <Card>
            <CardHeader className="flex justify-between">
                <div>
                    <CardTitle>Edit Lecture</CardTitle>
                    <CardDescription>Make Changes and click save when done.</CardDescription>
                </div>
                <div>
                    <Button disabled={removeLoading} onClick={removeLectureHandler} variant='destructive'>
                        {removeLoading ? (
                            <>
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                Please wait...
                            </>
                        ) : "Remove Lecture"}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div>
                    <Label>Title</Label>
                    <Input
                        value={lectureTitle}
                        onChange={(e) => setLectureTitle(e.target.value)}
                        type="text"
                        placeholder="Ex. Introduction to JavaScript"
                    />
                </div>
                <div className='my-5'>
                    <Label>Video <span className='text-red-500'>*</span></Label>
                    <Input
                        type="file"
                        accept='video/*'
                        onChange={fileChangeHandler}
                        disabled={mediaProgress}
                        className='w-full min-w-0'
                    />
                    <p className="mt-2 text-sm text-muted-foreground">No duration limit. {uploadLimit ? `Up to ${Math.round(uploadLimit / 1024 / 1024)} MiB per file on the current Cloudinary plan.` : 'The storage limit is checked before upload.'} Long videos may need compression or separate lectures. Keep this page open during upload.</p>
                    {uploadError && <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">{uploadError}</p>}
                    {uploadVideoInfo?.videoUrl && !mediaProgress && (
                        <p className='text-sm text-green-600 mt-1'>
                            ✅ Video ready: {uploadVideoInfo.videoUrl.split('/').pop()}
                        </p>
                    )}
                </div>
                <div className='flex items-center space-x-2 my-2'>
                    <Switch checked={isFree} onCheckedChange={setIsFree} id="airplane-mode" />
                    <Label htmlFor="airplane-mode">Allow a free preview</Label>
                </div>
                {mediaProgress && (
                    <div className='my-4'>
                        <Progress value={uploadProgress} />
                        <p className='text-sm text-muted-foreground mt-1'>
                            Uploading... {uploadProgress}%
                            {uploadProgress < 100
                                ? " (Please don't close this page)"
                                : " Processing..."}
                        </p>
                    </div>
                )}
                <div className='mt-4'>
                    <Button
                        disabled={isLoading || mediaProgress || btnDisabled}
                        onClick={editLectureHandler}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                Please wait...
                            </>
                        ) : "Save Changes"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default LectureTab;