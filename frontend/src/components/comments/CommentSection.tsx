'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FaUserCircle, FaReply, FaHeart, FaFlag, FaPaperPlane } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface Comment {
  id: string;
  userId: number;
  pokemonId: number;
  username: string;
  userPicture?: string;
  content: string;
  createdAt: string;
  likes: number;
  userHasLiked: boolean;
  replies?: Comment[];
}

interface CommentSectionProps {
  pokemonId: number;
}

const CommentSection: React.FC<CommentSectionProps> = ({ pokemonId }) => {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    fetchComments();
  }, [pokemonId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      // Ici vous remplaceriez par votre API
      // const response = await fetch(`/api/pokemon/${pokemonId}/comments`);
      // const data = await response.json();
      
      // Données de test en attendant l'API
      const mockComments = [
        {
          id: '1',
          userId: 101,
          pokemonId,
          username: 'AshKetchum',
          userPicture: 'https://i.pravatar.cc/150?img=8',
          content: "Ce Pokémon est incroyable en combat! Je l'utilise toujours dans mon équipe principale.",
          createdAt: new Date(Date.now() - 8600000).toISOString(),
          likes: 12,
          userHasLiked: false,
          replies: [
            {
              id: '1-1',
              userId: 102,
              pokemonId,
              username: 'MistyWaterflower',
              userPicture: 'https://i.pravatar.cc/150?img=5',
              content: "Je préfère les Pokémon eau, mais je dois admettre que celui-ci est impressionnant!",
              createdAt: new Date(Date.now() - 3600000).toISOString(),
              likes: 3,
              userHasLiked: true,
            }
          ]
        },
        {
          id: '2',
          userId: 103,
          pokemonId,
          username: 'BrockRock',
          userPicture: 'https://i.pravatar.cc/150?img=12',
          content: "Sa défense est exceptionnelle. Parfait pour les dresseurs qui aiment les stratégies défensives.",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          likes: 8,
          userHasLiked: false,
        }
      ];
      
      setComments(mockComments);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      toast.error('Impossible de charger les commentaires');
    } finally {
      setLoading(false);
    }
  };

  const handlePostComment = async () => {
    if (!session) {
      toast.error('Vous devez être connecté pour commenter');
      return;
    }
    
    if (!newComment.trim()) return;
    
    try {
      // Optimistic update
      const optimisticComment = {
        id: `temp-${Date.now()}`,
        userId: session.user.id as number,
        pokemonId,
        username: session.user.name || 'Utilisateur',
        content: newComment,
        createdAt: new Date().toISOString(),
        likes: 0,
        userHasLiked: false,
      };
      
      setComments([optimisticComment, ...comments]);
      setNewComment('');
      
      // Ici l'appel API pour sauvegarder le commentaire
      // const response = await fetch(`/api/pokemon/${pokemonId}/comments`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ content: newComment })
      // });
      
      // Dans un vrai scénario, vous replaceriez l'ID temporaire par celui retourné par l'API
      
      toast.success('Commentaire ajouté!');
    } catch (error) {
      console.error('Failed to post comment:', error);
      toast.error("Erreur lors de l'ajout du commentaire");
      // Rollback en cas d'erreur
      setComments(comments);
    }
  };

  const handlePostReply = async (commentId: string) => {
    if (!session) return;
    if (!replyContent.trim()) return;
    
    try {
      // Optimistic update for replies
      const newComments = comments.map(comment => {
        if (comment.id === commentId) {
          const newReply = {
            id: `temp-reply-${Date.now()}`,
            userId: session.user.id as number,
            pokemonId,
            username: session.user.name || 'Utilisateur',
            content: replyContent,
            createdAt: new Date().toISOString(),
            likes: 0,
            userHasLiked: false,
          };
          
          return {
            ...comment,
            replies: [...(comment.replies || []), newReply]
          };
        }
        return comment;
      });
      
      setComments(newComments);
      setReplyingTo(null);
      setReplyContent('');
      
      // Ici l'appel API pour sauvegarder la réponse
      
      toast.success('Réponse ajoutée!');
    } catch (error) {
      console.error('Failed to post reply:', error);
      toast.error("Erreur lors de l'ajout de la réponse");
    }
  };

  const handleLike = async (commentId: string) => {
    if (!session) {
      toast.error('Vous devez être connecté pour aimer un commentaire');
      return;
    }
    
    // Update optimistically
    const updatedComments = comments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          likes: comment.userHasLiked ? comment.likes - 1 : comment.likes + 1,
          userHasLiked: !comment.userHasLiked
        };
      }
      
      // Check in replies too
      if (comment.replies) {
        return {
          ...comment,
          replies: comment.replies.map(reply => {
            if (reply.id === commentId) {
              return {
                ...reply,
                likes: reply.userHasLiked ? reply.likes - 1 : reply.likes + 1,
                userHasLiked: !reply.userHasLiked
              };
            }
            return reply;
          })
        };
      }
      
      return comment;
    });
    
    setComments(updatedComments);
    
    // Ici l'appel API pour sauvegarder le like
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Commentaires</h2>
      
      {/* Formulaire pour ajouter un commentaire */}
      {session ? (
        <div className="mb-8">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              {session.user?.image ? (
                <img 
                  src={session.user.image} 
                  alt={session.user.name || 'User'} 
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <FaUserCircle className="w-10 h-10 text-gray-400" />
              )}
            </div>
            <div className="flex-grow">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Partagez votre avis sur ce Pokémon..."
                className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={handlePostComment}
                  disabled={!newComment.trim()}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                    newComment.trim() 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-gray-700 cursor-not-allowed'
                  }`}
                >
                  <FaPaperPlane />
                  Commenter
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-8 p-4 border border-dashed border-gray-700 rounded-lg text-center">
          <p className="text-gray-400 mb-2">Connectez-vous pour participer à la discussion</p>
          <button
            onClick={() => {/* Rediriger vers la page de login */}}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Se connecter
          </button>
        </div>
      )}
      
      {/* Liste des commentaires */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center p-8">
            <p className="text-gray-400">Soyez le premier à commenter!</p>
          </div>
        ) : (
          comments.map(comment => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 rounded-lg p-4 border border-gray-700"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  {comment.userPicture ? (
                    <img 
                      src={comment.userPicture} 
                      alt={comment.username} 
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <FaUserCircle className="w-10 h-10 text-gray-400" />
                  )}
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between">
                    <h4 className="font-bold">{comment.username}</h4>
                    <span className="text-gray-400 text-sm">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: fr })}
                    </span>
                  </div>
                  <p className="mt-1">{comment.content}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <button
                      onClick={() => handleLike(comment.id)}
                      className={`flex items-center gap-1 text-sm ${
                        comment.userHasLiked ? 'text-red-500' : 'text-gray-400'
                      }`}
                    >
                      <FaHeart /> {comment.likes}
                    </button>
                    <button
                      onClick={() => session && setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                      className="flex items-center gap-1 text-sm text-gray-400"
                      disabled={!session}
                    >
                      <FaReply /> Répondre
                    </button>
                    <button className="flex items-center gap-1 text-sm text-gray-400">
                      <FaFlag /> Signaler
                    </button>
                  </div>
                  
                  {/* Formulaire de réponse */}
                  {replyingTo === comment.id && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3"
                    >
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Votre réponse..."
                        className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:ring-1 focus:ring-blue-500 resize-none"
                        rows={2}
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={() => setReplyingTo(null)}
                          className="px-3 py-1 bg-gray-700 rounded"
                        >
                          Annuler
                        </button>
                        <button
                          onClick={() => handlePostReply(comment.id)}
                          disabled={!replyContent.trim()}
                          className={`px-3 py-1 rounded ${
                            replyContent.trim() ? 'bg-blue-600' : 'bg-gray-700'
                          }`}
                        >
                          Répondre
                        </button>
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Réponses */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-4 pl-4 border-l-2 border-gray-700 space-y-4">
                      {comment.replies.map(reply => (
                        <div key={reply.id} className="bg-gray-900 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <div className="flex-shrink-0">
                              {reply.userPicture ? (
                                <img 
                                  src={reply.userPicture} 
                                  alt={reply.username} 
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              ) : (
                                <FaUserCircle className="w-8 h-8 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-grow">
                              <div className="flex justify-between">
                                <h5 className="font-semibold">{reply.username}</h5>
                                <span className="text-gray-400 text-xs">
                                  {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true, locale: fr })}
                                </span>
                              </div>
                              <p className="mt-1 text-sm">{reply.content}</p>
                              <div className="flex items-center gap-3 mt-2">
                                <button
                                  onClick={() => handleLike(reply.id)}
                                  className={`flex items-center gap-1 text-xs ${
                                    reply.userHasLiked ? 'text-red-500' : 'text-gray-400'
                                  }`}
                                >
                                  <FaHeart /> {reply.likes}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection;